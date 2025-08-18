#!/usr/bin/env python3
"""
Universal Store Information Scraper
A flexible and intelligent scraping system that can extract store information from any website

拡張点（本編集）:
- 指定CSV（`store_id, clinic_name, store_name, Zipcode, adress, access`）への追記機能
- ヘッダ検証、重複回避（任意）、`store_id`生成（ブランド接頭辞+連番）
- CLI拡張: --csv-append-path, --clinic-name, --store-name, --dedupe-existing, --dry-run
"""

import re
import json
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup, Tag
from collections import Counter
import unicodedata
import csv
import os
from pathlib import Path
import fcntl
from contextlib import contextmanager
import io
import requests


class PatternMatcher:
    """Pattern matching utilities for information extraction"""
    
    # Japanese address patterns
    ADDRESS_PATTERNS = [
        # With postal code
        (r'〒\s*(\d{3}[-ー－]\d{4})\s*([^\n\r]{1,100})', 100),
        (r'〒\s*(\d{7})\s*([^\n\r]{1,100})', 95),
        
        # Full address patterns
        (r'((?:東京都|大阪府|京都府|北海道|[^\s]{2,4}県)[^\n\r]*?(?:市|区|町|村)[^\n\r]*?(?:\d+(?:[-ー－]\d+)*(?:番地?)?|[一二三四五六七八九十]+丁目)[^\n\r]*)', 90),
        (r'((?:東京都|大阪府|京都府|北海道|[^\s]{2,4}県)[^\n\r]*?[市区町村][^\n\r]*?\d+[-ー－]\d+[-ー－]\d+)', 85),
        
        # Building/Floor patterns
        (r'([^\n\r]*?(?:ビル|ビルディング|タワー|センター|プラザ|[^\s]+館)[^\n\r]*?(?:\d+階|[一二三四五六七八九十]+階|B\d+F?|\d+F))', 70),
    ]
    
    # Access/Station patterns
    ACCESS_PATTERNS = [
        # Station with walking time
        (r'「?([^「」\s]+(?:駅|停留場))」?\s*(?:から|より)?\s*(?:徒歩|歩いて)?\s*(?:約)?\s*(\d+)\s*分', 100),
        (r'([^「」\s]+(?:駅|停留場))\s*(?:徒歩|歩いて)\s*(?:約)?\s*(\d+)\s*分', 95),
        (r'(?:最寄り?駅?[:：]?\s*)([^「」\s]+駅)[^\n\r]*?(\d+)\s*分', 90),
        
        # Station only patterns
        (r'(?:最寄り?駅?[:：]?\s*)「?([^「」\s]+駅)」?', 70),
        (r'(?:アクセス|交通)[^\n\r]*?「?([^「」\s]+駅)」?', 65),
        
        # Line and station
        (r'([^「」\s]+線)\s*「?([^「」\s]+駅)」?', 80),
    ]
    
    # Phone number patterns
    PHONE_PATTERNS = [
        (r'(?:TEL|Tel|tel|電話|☎|📞)\s*[:：]?\s*([\d\-\(\)]{10,})', 100),
        (r'(\d{2,4}[-ー－]\d{2,4}[-ー－]\d{3,4})', 90),
        (r'(\d{10,11})', 70),
    ]
    
    # Business hours patterns
    HOURS_PATTERNS = [
        (r'(?:営業時間|受付時間|診療時間)[^\n\r]*?[:：]?\s*([^\n\r]+)', 100),
        (r'(\d{1,2}[:：]\d{2}\s*[~〜～ー－-]\s*\d{1,2}[:：]\d{2})', 90),
        (r'(?:平日|月.金)\s*[:：]?\s*(\d{1,2}[:：]\d{2}\s*[~〜～ー－-]\s*\d{1,2}[:：]\d{2})', 85),
    ]
    
    @classmethod
    def extract_with_confidence(cls, text: str, patterns: List[Tuple[str, int]]) -> List[Tuple[str, int]]:
        """Extract information with confidence scores"""
        results = []
        for pattern, base_confidence in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                if isinstance(match, tuple):
                    match = ' '.join(match).strip()
                else:
                    match = match.strip()
                if match:
                    results.append((match, base_confidence))
        return results


class StructuralAnalyzer:
    """Analyze HTML structure to identify information patterns"""
    
    @staticmethod
    def find_info_tables(soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Find and analyze information tables"""
        info_tables = []
        
        for table in soup.find_all('table'):
            rows = []
            for tr in table.find_all('tr'):
                cells = tr.find_all(['th', 'td'])
                if len(cells) >= 2:
                    header = cells[0].get_text(strip=True)
                    value = cells[1].get_text(strip=True)
                    rows.append({'header': header, 'value': value})
            
            if rows:
                info_tables.append({
                    'element': table,
                    'rows': rows,
                    'confidence': 100 if len(rows) > 3 else 80
                })
        
        return info_tables
    
    @staticmethod
    def find_definition_lists(soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Find and analyze definition lists (dl/dt/dd)"""
        info_lists = []
        
        for dl in soup.find_all('dl'):
            items = []
            dt_elements = dl.find_all('dt')
            dd_elements = dl.find_all('dd')
            
            for dt, dd in zip(dt_elements, dd_elements):
                if dt and dd:
                    items.append({
                        'header': dt.get_text(strip=True),
                        'value': dd.get_text(strip=True)
                    })
            
            if items:
                info_lists.append({
                    'element': dl,
                    'items': items,
                    'confidence': 95
                })
        
        return info_lists

    @staticmethod
    def find_heading_for(element: Tag) -> Optional[str]:
        """Find a nearby heading text for a given element (h1-h5 in ancestors or previous siblings)."""
        # Check within the same container first
        container = element
        for _ in range(3):  # climb up to 3 levels
            if not container or not container.parent:
                break
            container = container.parent
            # Search headings inside this container (prefer earlier ones)
            for tag_name in ['h2', 'h3', 'h4', 'h5', 'h1']:
                heading = container.find(tag_name)
                if heading and heading.get_text(strip=True):
                    return heading.get_text(strip=True)
        # Fallback to previous siblings
        sib = element
        for _ in range(5):
            sib = sib.previous_sibling if sib else None
            if isinstance(sib, Tag):
                for tag_name in ['h2', 'h3', 'h4', 'h5', 'h1', 'strong']:
                    heading = sib if sib.name == tag_name else sib.find(tag_name)
                    if heading and heading.get_text(strip=True):
                        return heading.get_text(strip=True)
        return None
    
    @staticmethod
    def find_info_sections(soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Find sections that likely contain store information"""
        info_sections = []
        info_keywords = ['店舗', '住所', 'アクセス', '所在地', '交通', '営業', '電話', 'TEL', 'Address', 'Access', 'Location']
        
        # Check various container elements
        for container in soup.find_all(['div', 'section', 'article']):
            text_content = container.get_text(strip=True)
            
            # Count matching keywords
            keyword_count = sum(1 for keyword in info_keywords if keyword in text_content)
            
            if keyword_count >= 2:
                info_sections.append({
                    'element': container,
                    'keyword_count': keyword_count,
                    'confidence': min(100, 60 + keyword_count * 10)
                })
        
        # Sort by confidence
        info_sections.sort(key=lambda x: x['confidence'], reverse=True)
        return info_sections[:10]  # Top 10 most likely sections


class IntelligentExtractor:
    """Main extraction engine with intelligent pattern recognition"""
    
    def __init__(self):
        self.pattern_matcher = PatternMatcher()
        self.structural_analyzer = StructuralAnalyzer()
    
    def extract_store_name(self, soup: BeautifulSoup, url: str) -> Tuple[str, int]:
        """Extract store name with confidence score"""
        candidates = []
        
        # 1. Check page title
        title_elem = soup.find('title')
        if title_elem:
            title = title_elem.get_text(strip=True)
            # Common patterns in titles
            if any(keyword in title for keyword in ['店', '院', 'クリニック', '店舗', 'ストア', 'ショップ']):
                candidates.append((title.split('|')[0].strip(), 85))
        
        # 2. Check h1 tags
        for h1 in soup.find_all('h1'):
            text = h1.get_text(strip=True)
            if text and len(text) < 100:
                confidence = 90
                if any(keyword in text for keyword in ['店', '院', 'クリニック', '店舗']):
                    confidence = 95
                candidates.append((text, confidence))
        
        # 3. Check h2 tags with store keywords
        for h2 in soup.find_all('h2'):
            text = h2.get_text(strip=True)
            if any(keyword in text for keyword in ['店', '院', 'クリニック', '店舗', 'ストア']):
                candidates.append((text, 80))
        # 4. Try to find heading near address containers on listing tabs
        for dl in soup.find_all('dl'):
            heading_text = self.structural_analyzer.find_heading_for(dl)
            if heading_text and any(k in heading_text for k in ['クリニック', '歯科', '医院', '院']):
                candidates.append((heading_text, 85))
        
        # 5. Check meta property og:site_name
        og_site = soup.find('meta', property='og:site_name')
        if og_site and og_site.get('content'):
            candidates.append((og_site['content'], 75))
        
        # 6. Check structured data (JSON-LD)
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    if data.get('@type') in ['Store', 'LocalBusiness', 'MedicalClinic']:
                        if data.get('name'):
                            candidates.append((data['name'], 100))
                    elif data.get('name'):
                        candidates.append((data['name'], 70))
            except:
                continue
        
        # Return the highest confidence candidate
        if candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0]
        
        return "", 0
    
    def extract_address(self, soup: BeautifulSoup) -> Tuple[str, int]:
        """Extract address with confidence score"""
        text_content = soup.get_text()
        candidates = []
        
        # 1. Pattern matching on full text
        address_matches = self.pattern_matcher.extract_with_confidence(
            text_content, 
            PatternMatcher.ADDRESS_PATTERNS
        )
        candidates.extend(address_matches)
        
        # 2. Check structured containers
        tables = self.structural_analyzer.find_info_tables(soup)
        for table in tables:
            for row in table['rows']:
                if any(keyword in row['header'] for keyword in ['住所', '所在地', 'Address', 'Location']):
                    candidates.append((row['value'], 95))
        
        # 3. Check definition lists
        dl_lists = self.structural_analyzer.find_definition_lists(soup)
        for dl in dl_lists:
            for item in dl['items']:
                if any(keyword in item['header'] for keyword in ['住所', '所在地', 'Address']):
                    candidates.append((item['value'], 95))
        
        # 4. Check structured data
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and data.get('address'):
                    addr = data['address']
                    if isinstance(addr, dict):
                        parts = []
                        if addr.get('postalCode'):
                            parts.append(f"〒{addr['postalCode']}")
                        if addr.get('addressRegion'):
                            parts.append(addr['addressRegion'])
                        if addr.get('addressLocality'):
                            parts.append(addr['addressLocality'])
                        if addr.get('streetAddress'):
                            parts.append(addr['streetAddress'])
                        if parts:
                            candidates.append((' '.join(parts), 100))
                    elif isinstance(addr, str):
                        candidates.append((addr, 100))
            except:
                continue
        
        # Clean and deduplicate
        cleaned_candidates = []
        seen = set()
        for addr, conf in candidates:
            # Clean address
            addr = re.sub(r'\s+', ' ', addr).strip()
            # Normalize
            addr_normalized = unicodedata.normalize('NFKC', addr)
            
            if addr_normalized and addr_normalized not in seen:
                seen.add(addr_normalized)
                cleaned_candidates.append((addr, conf))
        
        if cleaned_candidates:
            cleaned_candidates.sort(key=lambda x: (x[1], len(x[0])), reverse=True)
            return cleaned_candidates[0]
        
        return "", 0
    
    def extract_access(self, soup: BeautifulSoup) -> Tuple[str, int]:
        """Extract access information with confidence score"""
        text_content = soup.get_text()
        candidates = []
        
        # 1. Pattern matching for station access
        access_matches = self.pattern_matcher.extract_with_confidence(
            text_content,
            PatternMatcher.ACCESS_PATTERNS
        )
        
        # Process matches to find the best station info
        station_info = {}
        for match, conf in access_matches:
            # Extract station and minutes
            station_match = re.search(r'([^「」\s]+(?:駅|停留場))', match)
            minutes_match = re.search(r'(\d+)\s*分', match)
            
            if station_match:
                station = station_match.group(1)
                minutes = minutes_match.group(1) if minutes_match else None
                
                if station not in station_info or conf > station_info[station][1]:
                    station_info[station] = (minutes, conf)
        
        # Format station information
        for station, (minutes, conf) in station_info.items():
            if minutes:
                candidates.append((f"{station}から徒歩約{minutes}分", conf))
            else:
                candidates.append((f"{station}最寄り", conf - 20))
        
        # 2. Check structured data
        tables = self.structural_analyzer.find_info_tables(soup)
        for table in tables:
            for row in table['rows']:
                if any(keyword in row['header'] for keyword in ['アクセス', '交通', 'Access', '最寄り駅']):
                    candidates.append((row['value'], 90))
        
        # 3. Check definition lists
        dl_lists = self.structural_analyzer.find_definition_lists(soup)
        for dl in dl_lists:
            for item in dl['items']:
                if any(keyword in item['header'] for keyword in ['アクセス', '交通', 'Access', '最寄り駅']):
                    candidates.append((item['value'], 90))
        
        if candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0]
        
        return "", 0
    
    def extract_phone(self, soup: BeautifulSoup) -> Tuple[str, int]:
        """Extract phone number with confidence score"""
        text_content = soup.get_text()
        candidates = []
        
        # Pattern matching
        phone_matches = self.pattern_matcher.extract_with_confidence(
            text_content,
            PatternMatcher.PHONE_PATTERNS
        )
        
        # Clean phone numbers
        for phone, conf in phone_matches:
            # Remove common non-digit characters
            cleaned = re.sub(r'[^\d\-]', '', phone)
            if cleaned and len(cleaned) >= 10:
                candidates.append((phone, conf))
        
        if candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0]
        
        return "", 0
    
    def extract_hours(self, soup: BeautifulSoup) -> Tuple[str, int]:
        """Extract business hours with confidence score"""
        text_content = soup.get_text()
        candidates = []
        
        # Pattern matching
        hours_matches = self.pattern_matcher.extract_with_confidence(
            text_content,
            PatternMatcher.HOURS_PATTERNS
        )
        candidates.extend(hours_matches)
        
        if candidates:
            candidates.sort(key=lambda x: (x[1], len(x[0])), reverse=True)
            return candidates[0]
        
        return "", 0
    
    def extract_all_info(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """Extract all store information with confidence scores"""
        
        # Extract each piece of information
        name, name_conf = self.extract_store_name(soup, url)
        address, addr_conf = self.extract_address(soup)
        access, access_conf = self.extract_access(soup)
        phone, phone_conf = self.extract_phone(soup)
        hours, hours_conf = self.extract_hours(soup)
        
        # Calculate overall confidence
        total_conf = sum([name_conf, addr_conf, access_conf]) / 3
        
        return {
            'name': name,
            'address': address,
            'access': access,
            'phone': phone,
            'hours': hours,
            'url': url,
            'confidence_scores': {
                'name': name_conf,
                'address': addr_conf,
                'access': access_conf,
                'phone': phone_conf,
                'hours': hours_conf,
                'overall': total_conf
            }
        }


class UniversalStoreScraper:
    """Universal store information scraper with backward compatibility"""
    
    def __init__(self):
        self.intelligent_extractor = IntelligentExtractor()
        
        # Legacy site-specific extractors for backward compatibility
        self.legacy_extractors = {
            'dioclinic': self._extract_dio_clinic,
            'eminal-clinic': self._extract_eminal_clinic,
            'frey-a': self._extract_freya_clinic,
            'seishin-biyou': self._extract_seishin_clinic,
            's-b-c.net': self._extract_sbc_clinic,
            'rizeclinic': self._extract_rize_clinic,
        }
    
    def extract_store_info(self, soup: BeautifulSoup, url: str, store_name: str = "") -> Dict[str, Any]:
        """Main extraction method with fallback to legacy extractors"""
        domain = urlparse(url).netloc
        
        # Check if we have a legacy extractor for this domain
        for pattern, extractor in self.legacy_extractors.items():
            if pattern in domain:
                # Use legacy extractor
                legacy_result = extractor(soup, url, store_name)
                # If legacy extractor returns good results, use them
                if legacy_result.get('name') and (legacy_result.get('address') or legacy_result.get('access')):
                    return legacy_result
        
        # Use intelligent universal extractor
        result = self.intelligent_extractor.extract_all_info(soup, url)
        
        # If store_name was provided and we didn't find a better one, use it
        if store_name and not result['name']:
            result['name'] = store_name
        
        # If confidence is too low, try to enhance with section analysis
        if result['confidence_scores']['overall'] < 70:
            sections = self.intelligent_extractor.structural_analyzer.find_info_sections(soup)
            for section in sections[:3]:  # Check top 3 sections
                section_soup = BeautifulSoup(str(section['element']), 'html.parser')
                section_result = self.intelligent_extractor.extract_all_info(section_soup, url)
                
                # Update with better results
                for field in ['name', 'address', 'access', 'phone', 'hours']:
                    if section_result['confidence_scores'][field] > result['confidence_scores'][field]:
                        result[field] = section_result[field]
                        result['confidence_scores'][field] = section_result['confidence_scores'][field]
        
        return result
    
    # Legacy extractors for backward compatibility
    def _extract_dio_clinic(self, soup: BeautifulSoup, url: str, clinic_name: str) -> Dict[str, Any]:
        """Legacy DIO clinic extractor"""
        clinic_info = {
            'name': clinic_name,
            'address': '',
            'access': '',
            'url': url
        }
        
        name_elem = soup.find('h2', class_='clinic-name')
        if name_elem:
            clinic_info['name'] = name_elem.get_text(strip=True)
        
        address_elem = soup.find('div', class_='address')
        if address_elem:
            clinic_info['address'] = address_elem.get_text(strip=True)
        
        access_elem = soup.find('div', class_='access')
        if access_elem:
            clinic_info['access'] = access_elem.get_text(strip=True)
        
        return clinic_info
    
    def _extract_eminal_clinic(self, soup: BeautifulSoup, url: str, clinic_name: str) -> Dict[str, Any]:
        """Legacy Eminal clinic extractor"""
        clinic_info = {
            'name': clinic_name,
            'address': '',
            'access': '',
            'url': url
        }
        
        for tr in soup.find_all('tr'):
            th = tr.find('th')
            td = tr.find('td')
            if th and td:
                header = th.get_text(strip=True)
                if '院名' in header:
                    clinic_info['name'] = td.get_text(strip=True)
                elif '住所' in header:
                    clinic_info['address'] = td.get_text(strip=True)
                elif 'アクセス' in header:
                    clinic_info['access'] = td.get_text(strip=True)
        
        return clinic_info
    
    def _extract_freya_clinic(self, soup: BeautifulSoup, url: str, clinic_name: str) -> Dict[str, Any]:
        """Legacy Freya clinic extractor"""
        clinic_info = {
            'name': clinic_name,
            'address': '',
            'access': '',
            'url': url
        }
        
        h1_elem = soup.find('h1')
        if h1_elem:
            clinic_info['name'] = h1_elem.get_text(strip=True)
        
        for tr in soup.find_all('tr'):
            th = tr.find('th')
            td = tr.find('td')
            if th and td:
                header = th.get_text(strip=True)
                if '所在地' in header:
                    clinic_info['address'] = td.get_text(strip=True)
                elif 'アクセス' in header:
                    clinic_info['access'] = td.get_text(strip=True)
        
        return clinic_info
    
    def _extract_seishin_clinic(self, soup: BeautifulSoup, url: str, clinic_name: str) -> Dict[str, Any]:
        """Legacy Seishin clinic extractor"""
        clinic_info = {
            'name': clinic_name,
            'address': '',
            'access': '',
            'url': url
        }
        
        h1_elem = soup.find('h1')
        if h1_elem:
            clinic_info['name'] = h1_elem.get_text(strip=True)
        
        text_content = soup.get_text()
        
        # Address extraction
        address_patterns = [
            r'〒\d{3}-\d{4}\s*[^\n]*?(?:市|区|町|村)[^\n]*?(?:丁目|番地|[0-9]+F?)',
            r'〒\d{3}-\d{4}[^\n]*',
            r'(?:東京都|大阪府|京都府|北海道|.*?県)[^\n]*?(?:市|区|町|村)[^\n]*?[0-9]',
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, text_content)
            if match:
                address = match.group(0).strip()
                address = re.sub(r'\s+', ' ', address)
                clinic_info['address'] = address
                break
        
        # Access extraction
        access_patterns = [
            r'([^\s]+駅)[^\n]*?(?:から|より)[^\n]*?(?:徒歩|歩いて)[^\n]*?(\d+)分',
            r'([^\s]+駅)[^\n]*?(?:徒歩|歩いて)[^\n]*?(\d+)分',
        ]
        
        found_station = None
        min_minutes = 999
        
        for pattern in access_patterns:
            matches = re.findall(pattern, text_content)
            for match in matches:
                if len(match) == 2:
                    station = match[0]
                    try:
                        minutes = int(match[1])
                        if minutes < min_minutes:
                            min_minutes = minutes
                            found_station = f"{station}から徒歩約{minutes}分"
                    except ValueError:
                        continue
        
        if found_station:
            clinic_info['access'] = found_station
        
        return clinic_info
    
    def _extract_sbc_clinic(self, soup: BeautifulSoup, url: str, clinic_name: str) -> Dict[str, Any]:
        """Legacy SBC clinic extractor"""
        return self._extract_seishin_clinic(soup, url, clinic_name)  # Similar pattern
    
    def _extract_rize_clinic(self, soup: BeautifulSoup, url: str, clinic_name: str) -> Dict[str, Any]:
        """Legacy Rize clinic extractor"""
        clinic_info = {
            'name': clinic_name,
            'address': '',
            'access': '',
            'url': url
        }
        
        h1_elem = soup.find('h1')
        if h1_elem:
            clinic_info['name'] = h1_elem.get_text(strip=True)
        
        info_table = soup.find('table')
        if info_table:
            for tr in info_table.find_all('tr'):
                th = tr.find('th')
                td = tr.find('td')
                if th and td:
                    header = th.get_text(strip=True)
                    if '住所' in header:
                        clinic_info['address'] = td.get_text(strip=True)
        
        text_content = soup.get_text()
        station_patterns = [
            r'「([^\s]+駅)」[^\n]*?(?:徒歩|歩いて)[^\n]*?(\d+)分',
            r'([^\s]+駅)[^\n]*?(?:徒歩|歩いて)[^\n]*?(\d+)分',
        ]
        
        found_station = None
        min_minutes = 999
        
        for pattern in station_patterns:
            matches = re.findall(pattern, text_content)
            for match in matches:
                if len(match) == 2:
                    station = match[0]
                    try:
                        minutes = int(match[1])
                        if minutes < min_minutes:
                            min_minutes = minutes
                            found_station = f"{station}から徒歩約{minutes}分"
                    except ValueError:
                        continue
        
        if found_station:
            clinic_info['access'] = found_station
        
        return clinic_info


CSV_EXPECTED_HEADER = [
    'store_id', 'clinic_name', 'store_name', 'Zipcode', 'adress', 'access'
]
CSV_EXPECTED_HEADER_WITH_IMAGE = [
    'store_id', 'clinic_name', 'store_name', 'Zipcode', 'adress', 'access', 'image_path'
]


def read_csv_header(csv_path: str) -> Optional[List[str]]:
    try:
        with open(csv_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            return header
    except FileNotFoundError:
        return None


def validate_csv_header(csv_path: str, expected_header: List[str]) -> None:
    header = read_csv_header(csv_path)
    if header is None:
        raise FileNotFoundError(f"CSVが見つかりません: {csv_path}")
    # 許容: 旧6列 or 新7列（image_path付き）
    if header not in (expected_header, CSV_EXPECTED_HEADER_WITH_IMAGE):
        raise ValueError(
            f"CSVヘッダ不一致\n期待: {expected_header} または {CSV_EXPECTED_HEADER_WITH_IMAGE}\n実際: {header}\nファイル: {csv_path}"
        )


def ensure_csv_has_image_column(csv_path: str) -> None:
    """ヘッダに image_path が無ければ追加する（既存行は空列のままでも可）。"""
    header = read_csv_header(csv_path)
    if header is None:
        raise FileNotFoundError(f"CSVが見つかりません: {csv_path}")
    if 'image_path' in header:
        return
    # 先頭行のみ置換
    with open(csv_path, 'r', encoding='utf-8') as rf:
        lines = rf.readlines()
    if not lines:
        # 空ファイルの場合は新ヘッダを書き込む
        with open(csv_path, 'w', encoding='utf-8', newline='') as wf:
            writer = csv.writer(wf)
            writer.writerow(CSV_EXPECTED_HEADER_WITH_IMAGE)
        return
    # 先頭行をカンマ分割し image_path を追加
    first = lines[0].rstrip('\r\n')
    if first:
        new_first = first + ',image_path' if not first.endswith(',') else first + 'image_path'
        lines[0] = new_first + '\n'
        with open(csv_path, 'w', encoding='utf-8') as wf:
            wf.writelines(lines)


def iter_existing_rows(csv_path: str):
    with open(csv_path, 'r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row


def detect_brand_prefix_from_existing(csv_path: str, clinic_name: str) -> Optional[str]:
    """既存CSVから同一clinic_nameに紐づくstore_id接頭辞を推定（最頻）"""
    prefix_counter: Counter[str] = Counter()
    for row in iter_existing_rows(csv_path):
        if row.get('clinic_name') == clinic_name and row.get('store_id'):
            sid = row['store_id']
            if '_' in sid:
                prefix = sid.split('_', 1)[0]
                if prefix:
                    prefix_counter[prefix] += 1
    if prefix_counter:
        return prefix_counter.most_common(1)[0][0]
    return None


def derive_prefix_from_host(url: str) -> str:
    """ホスト名から接頭辞候補を生成（例: s-b-c.net -> sbc）"""
    host = urlparse(url).hostname or ''
    host = host.split(':')[0]
    # 例: 's-b-c.net' -> ['s-b-c','net'] -> 's-b-c'
    root = host.rsplit('.', 2)[0] if '.' in host else host
    # ハイフン区切りの頭文字連結 or 先頭英字を抽出
    if '-' in root:
        letters = ''.join(part[0] for part in root.split('-') if part)
        candidate = letters.lower()
    else:
        # 英字のみ抽出し先頭3-6文字
        letters = ''.join(ch for ch in root if ch.isalpha())
        candidate = letters[:6].lower() if letters else 'store'
    return candidate or 'store'


def next_running_number(csv_path: str, prefix: str) -> int:
    max_n = 0
    for row in iter_existing_rows(csv_path):
        sid = row.get('store_id') or ''
        if sid.startswith(prefix + '_'):
            num_part = sid.split('_', 1)[1]
            try:
                n = int(num_part)
                if n > max_n:
                    max_n = n
            except ValueError:
                continue
    return max_n + 1


def generate_store_id(csv_path: str, clinic_name: str, url: str) -> str:
    prefix = detect_brand_prefix_from_existing(csv_path, clinic_name)
    if not prefix or len(prefix) < 2:
        prefix = derive_prefix_from_host(url)
    n = next_running_number(csv_path, prefix)
    return f"{prefix}_{n:03d}"


def extract_zipcode(address_text: str) -> str:
    if not address_text:
        return ''
    # 〒付き、またはハイフン有無を許容
    m = re.search(r'〒\s*(\d{3}[-ー－]?\d{4})', address_text)
    if m:
        num = m.group(1).replace('ー', '-').replace('－', '-')
        if '-' not in num and len(num) == 7:
            num = f"{num[:3]}-{num[3:]}"
        return f"〒{num}"
    # 7桁連続のみ検出
    m2 = re.search(r'\b(\d{7})\b', address_text)
    if m2:
        num = m2.group(1)
        return f"〒{num[:3]}-{num[3:]}"
    # NNN-NNNN 形式のみ検出
    m3 = re.search(r'\b(\d{3}-\d{4})\b', address_text)
    if m3:
        return f"〒{m3.group(1)}"
    return ''


def safe_access_text(text: str) -> str:
    t = (text or '').strip()
    return t if t else '-'


def remove_zip_from_address(address_text: str) -> str:
    if not address_text:
        return ''
    t = address_text.strip()
    # 先頭の〒NNN-NNNN または NNN-NNNN を除去
    t = re.sub(r'^\s*〒?\s*\d{3}[-ー－]?\d{4}\s*', '', t)
    # 余分な全角ダッシュを半角に
    t = t.replace('ー', '-').replace('－', '-')
    return t.strip()


def append_csv_row(csv_path: str, row_values: List[str]) -> None:
    # 末尾が改行で終わっていない場合は先に改行を補う
    needs_leading_newline = False
    try:
        with open(csv_path, 'rb') as rf:
            rf.seek(0, os.SEEK_END)
            size = rf.tell()
            if size > 0:
                rf.seek(-1, os.SEEK_END)
                last = rf.read(1)
                needs_leading_newline = last not in (b"\n", b"\r")
    except FileNotFoundError:
        needs_leading_newline = False

    with open(csv_path, 'a', encoding='utf-8', newline='') as f:
        # 排他ロック（POSIX）
        try:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        except Exception:
            pass
        if needs_leading_newline:
            f.write("\n")
        writer = csv.writer(f)
        writer.writerow(row_values)
        try:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except Exception:
            pass


def row_exists(csv_path: str, clinic_name: str, store_name: str) -> bool:
    for row in iter_existing_rows(csv_path):
        if row.get('clinic_name') == clinic_name and row.get('store_name') == store_name:
            return True
    return False


# Export the main class
__all__ = ['UniversalStoreScraper']


def extract_tabbed_clinic_cards(soup: BeautifulSoup, fallback_brand: str) -> List[Dict[str, str]]:
    """Extract multiple clinic cards from a tabbed section like Zenyum.

    Returns a list of dicts: {clinic_name, store_name, address}
    """
    results: List[Dict[str, str]] = []
    section = soup.find('section', id='clinic-list') or soup.find('section', class_='clinic-section-updated')
    if not section:
        return results

    # Brand heading
    brand_elem = section.find('h2', class_='main-heading-updated') or section.find('h2')
    brand = brand_elem.get_text(strip=True) if brand_elem else (fallback_brand or '')

    # All cards across all tabs
    for card in section.select('.clinic-card-updated'):
        title_elem = card.select_one('.clinic-content-updated .heading') or card.select_one('h2.heading, h3.heading')
        store_name = title_elem.get_text(strip=True) if title_elem else ''

        # Address: the second .clinic-data-updated block's first <p>
        address_text = ''
        data_blocks = card.select('.clinic-data-updated')
        if len(data_blocks) >= 2:
            addr_p = data_blocks[1].find('p')
            if addr_p:
                address_text = addr_p.get_text(strip=True)

        # 画像URL候補（カード内）
        image_url = ''
        # よくあるlazy属性も考慮
        img = card.find('img')
        if img:
            srcset = (img.get('data-srcset') or img.get('srcset') or '').strip()
            if srcset:
                # 最初のURLを採用
                image_url = srcset.split(',')[0].strip().split(' ')[0]
            image_url = image_url or (img.get('data-src') or img.get('data-original') or img.get('data-lazy') or img.get('src') or '').strip()

        if store_name or address_text:
            results.append({
                'clinic_name': brand,
                'store_name': store_name,
                'address': address_text,
                'image_url': image_url,
            })

    return results


def extract_multi_clinic_cards_generic(soup: BeautifulSoup, fallback_brand: str) -> List[Dict[str, str]]:
    """Generic multi-card extractor without site-specific classes.

    Heuristics:
    - Look for repeated card-like containers whose headings look like clinic names
    - Find an address text near the heading: either labeled with 住所 or matching Japanese address pattern
    """
    results: List[Dict[str, str]] = []

    # Candidate containers: any element whose class hints card/clinic
    candidate_selectors = [
        '[class*="clinic-card"]', '[class*="clinic_item"]', '[class*="clinic"]', '[class*="card"]',
        'article', 'li', 'div'
    ]

    # Japanese prefecture/address quick regex
    addr_regex = re.compile(r'(?:〒\s*\d{3}[-ー－]?\d{4})|(?:東京都|大阪府|京都府|北海道|[\u4e00-\u9faf]{2,4}県)')

    def looks_like_clinic_name(text: str) -> bool:
        return any(k in text for k in ['クリニック', '歯科', '医院', 'デンタル', '矯正']) and len(text) <= 60

    brand = fallback_brand or ''
    if not brand:
        h = soup.find(['h1', 'h2'])
        brand = h.get_text(strip=True) if h else ''

    seen = set()
    for sel in candidate_selectors:
        for container in soup.select(sel):
            # heading inside
            heading = None
            for tag in ['h3', 'h2', 'h4', 'h5']:
                h = container.find(tag)
                if h and looks_like_clinic_name(h.get_text(strip=True)):
                    heading = h.get_text(strip=True)
                    break
            if not heading:
                continue

            # find address in container
            addr_text = ''
            # 住所ラベルと値の組み合わせ
            labels = container.find_all(text=lambda t: isinstance(t, str) and '住所' in t)
            for lbl in labels:
                # next p/span text
                p = getattr(lbl, 'parent', None)
                if p:
                    nxt = p.find_next('p') or p.find_next('span')
                    if nxt and addr_regex.search(nxt.get_text()):
                        addr_text = nxt.get_text(strip=True)
                        break
            if not addr_text:
                # 任意の<p>で住所らしいもの
                for p in container.find_all('p'):
                    t = p.get_text(strip=True)
                    if addr_regex.search(t) and len(t) <= 120:
                        addr_text = t
                        break

            key = (heading, addr_text)
            if (heading or addr_text) and key not in seen:
                seen.add(key)
                # 画像URL（コンテナ内の最初の<img>）
                image_url = ''
                img = container.find('img')
                if img:
                    srcset = (img.get('data-srcset') or img.get('srcset') or '').strip()
                    if srcset:
                        image_url = srcset.split(',')[0].strip().split(' ')[0]
                    image_url = image_url or (img.get('data-src') or img.get('data-original') or img.get('data-lazy') or img.get('src') or '').strip()

                results.append({
                    'clinic_name': brand or '提携医療機関',
                    'store_name': heading,
                    'address': addr_text,
                    'image_url': image_url,
                })

        if len(results) >= 3:
            break

    return results


def _resolve_img_url(img_tag: Tag, base_url: str) -> Optional[str]:
    if not img_tag:
        return None
    # srcset優先（最初のURL）
    srcset = (img_tag.get('data-srcset') or img_tag.get('srcset') or '').strip()
    if srcset:
        cand = srcset.split(',')[0].strip().split(' ')[0]
        if cand:
            return urljoin(base_url, cand)
    # 一般的なlazy属性
    for key in ['data-src', 'data-original', 'data-lazy', 'src']:
        val = (img_tag.get(key) or '').strip()
        if val:
            return urljoin(base_url, val)
    return None


def extract_store_image_url(soup: BeautifulSoup, base_url: str, clinic_name: str = '', store_name: str = '') -> str:
    """店舗画像のURLを推定して返す。見つからなければ空文字。

    優先順位:
      1) JSON-LDの image/logo/photo
      2) og:image
      3) store_name/clinic_name と関係が強い<img>
      4) ヒーロー/メインビジュアルらしい<img>
      5) 最初の大きめの<img>
    """
    # 1. JSON-LD
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            if isinstance(data, dict):
                for key in ['image', 'logo', 'photo']:
                    if key in data:
                        val = data[key]
                        if isinstance(val, str) and val.startswith(('http://', 'https://', '/')):
                            return urljoin(base_url, val)
                        if isinstance(val, list) and val:
                            first = val[0]
                            if isinstance(first, str):
                                return urljoin(base_url, first)
        except Exception:
            pass

    # 2. og:image
    og = soup.find('meta', property='og:image') or soup.find('meta', attrs={'name': 'og:image'})
    if og and og.get('content'):
        return urljoin(base_url, og['content'])

    # 3. 名前に関連する<img>
    name_keywords = [k for k in [store_name, clinic_name] if k]
    if name_keywords:
        for img in soup.find_all('img'):
            alt = (img.get('alt') or '').strip()
            if any(k and k in alt for k in name_keywords) or any(w in alt for w in ['外観', '院内', 'クリニック', '店舗']):
                url = _resolve_img_url(img, base_url)
                if url:
                    return url

    # 4. ヒーロー/メインビジュアル
    selectors = [
        '.hero img', '.kv img', '.main-visual img', '.mv img', '.visual img', '.clinic img', '.store img'
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.name == 'img':
            url = _resolve_img_url(el, base_url)
            if url:
                return url

    # 5. 大きめの<img>
    best_img = None
    best_area = -1
    for img in soup.find_all('img'):
        try:
            w = int(img.get('width') or 0)
            h = int(img.get('height') or 0)
            area = w * h
            if area > best_area:
                best_area = area
                best_img = img
        except Exception:
            continue
    if best_img:
        url = _resolve_img_url(best_img, base_url)
        if url:
            return url

    return ''


def brand_dir_from_store_id(store_id: str) -> str:
    return (store_id or 'store_000').split('_', 1)[0]


def ensure_brand_dir_exists(brand_slug: str) -> Path:
    base = Path('public/images/clinics')
    brand_path = base / brand_slug
    brand_path.mkdir(parents=True, exist_ok=True)
    return brand_path


def download_and_save_webp(image_url: str, dest_path: Path) -> None:
    """画像を取得しWebPで保存する。Pillowが無い場合はエラーを出す。"""
    if not image_url:
        raise ValueError('image_url is empty')
    resp = requests.get(image_url, timeout=30, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    resp.raise_for_status()
    content_type = (resp.headers.get('Content-Type') or '').lower()

    # 直接webpならそのまま保存
    if 'image/webp' in content_type or image_url.lower().endswith('.webp'):
        dest_path.write_bytes(resp.content)
        return

    # Pillowで変換
    try:
        from PIL import Image
    except Exception:
        raise RuntimeError('Pillowが未インストールです。pip install pillow を実行してください。')

    with Image.open(io.BytesIO(resp.content)) as im:
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGBA')
        else:
            im = im.convert('RGB')
        im.save(str(dest_path), format='WEBP', quality=85, method=6)


if __name__ == '__main__':
    import argparse
    import requests

    parser = argparse.ArgumentParser(description='Universal Store Information Scraper CLI')
    parser.add_argument('url', help='スクレイピング対象の店舗ページのURL')
    parser.add_argument('--clinic-name', help='ブランド/クリニック名（CSVのclinic_name）', default="")
    parser.add_argument('--store-name', help='院名/店舗名（CSVのstore_name）', default="")
    parser.add_argument('--csv-append-path', help='追記先CSVパス', default=str(Path('/Users/hattaryoga/Desktop/kiro_2_サイト構成分析/public/mouthpiece/data copy/出しわけSS - stores.csv')))
    parser.add_argument('--dedupe-existing', action='store_true', help='既存CSVでclinic_name+store_nameが存在する場合はスキップ')
    parser.add_argument('--dry-run', action='store_true', help='CSVへは書き込まず、出力内容だけ表示')
    parser.add_argument('--confidence', action='store_true', help='抽出データの信頼度スコアを表示する')
    parser.add_argument('--tabbed-cards', action='store_true', help='タブ型の院カードをまとめて抽出・追記する（Zenyum向け）')
    parser.add_argument('--auto-list', action='store_true', help='カード型一覧を自動検出して複数院を抽出・追記（汎用ヒューリスティクス）')
    parser.add_argument('--render', action='store_true', help='PlaywrightでJSレンダリングしてから解析（必要時のみ推奨）')
    parser.add_argument('--wait-selector', default='', help='レンダリング時に待機するCSSセレクタ（任意）')
    args = parser.parse_args()

    csv_path = args.csv_append_path
    print(f"URLをスクレイピング中: {args.url}")

    try:
        # CSVヘッダ検証 + 画像列追加
        validate_csv_header(csv_path, CSV_EXPECTED_HEADER)
        ensure_csv_has_image_column(csv_path)

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        def fetch_html(url: str) -> str:
            if not args.render:
                resp = requests.get(url, headers=headers, timeout=20)
                resp.raise_for_status()
                return resp.text
            # Render with Playwright
            try:
                from playwright.sync_api import sync_playwright
            except Exception as e:
                raise RuntimeError('Playwrightが未インストールです。pip install playwright && python -m playwright install chromium を実行してください。')
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context()
                page = context.new_page()
                page.set_default_navigation_timeout(30000)
                page.set_default_timeout(30000)
                page.goto(url, wait_until='domcontentloaded', timeout=60000)
                if args.wait_selector:
                    try:
                        page.wait_for_selector(args.wait_selector, timeout=15000)
                    except Exception:
                        pass
                content = page.content()
                context.close()
                browser.close()
                return content

        html = fetch_html(args.url)
        soup = BeautifulSoup(html, 'html.parser')

        scraper = UniversalStoreScraper()

        # タブ型カードの一括抽出
        if args.tabbed_cards:
            brand_hint = args.clinic_name or ''
            cards = extract_tabbed_clinic_cards(soup, brand_hint)
            if not cards:
                print("カードUIが見つかりませんでした（--tabbed-cards無視）。通常抽出にフォールバックします。")
            else:
                for card in cards:
                    clinic_name = (card.get('clinic_name') or args.clinic_name or '').strip() or (soup.find('meta', property='og:site_name') or {}).get('content', '')
                    store_name = (card.get('store_name') or '').strip()
                    original_address = (card.get('address') or '').strip()
                    card_img = (card.get('image_url') or '').strip()
                    zipcode = extract_zipcode(original_address)
                    address_full = remove_zip_from_address(original_address)
                    access_text = '-'

                    if not clinic_name:
                        clinic_name = '提携歯科医院'

                    # store_id生成と重複
                    if args.dedupe_existing and row_exists(csv_path, clinic_name, store_name):
                        print(f"重複スキップ: {clinic_name} / {store_name}")
                        continue
                    store_id = generate_store_id(csv_path, clinic_name, args.url)

                    # 画像の保存
                    image_url = urljoin(args.url, card_img) if card_img else ''
                    brand_slug = brand_dir_from_store_id(store_id)
                    brand_dir = ensure_brand_dir_exists(brand_slug)
                    image_dest = brand_dir / f"{store_id}.webp"
                    if image_url and not args.dry_run:
                        try:
                            download_and_save_webp(image_url, image_dest)
                        except Exception as e:
                            print(f"画像保存に失敗: {e}")
                    csv_image_path = str(image_dest.as_posix()) if image_url else ''

                    csv_row = [store_id, clinic_name, store_name, zipcode, address_full, access_text, csv_image_path]
                    print('\n--- カード抽出（CSV行）---')
                    print(','.join(f'"{c}"' if ',' in (c or '') else (c or '') for c in csv_row))
                    if not args.dry_run:
                        append_csv_row(csv_path, csv_row)
                # 全カード処理後に終了
                raise SystemExit(0)

        # 汎用カード自動検出
        if args.auto_list and not args.tabbed_cards:
            brand_hint = args.clinic_name or ''
            cards = extract_multi_clinic_cards_generic(soup, brand_hint)
            if cards:
                for card in cards:
                    clinic_name = (card.get('clinic_name') or brand_hint).strip()
                    store_name = (card.get('store_name') or '').strip()
                    original_address = (card.get('address') or '').strip()
                    card_img = (card.get('image_url') or '').strip()
                    zipcode = extract_zipcode(original_address)
                    address_full = remove_zip_from_address(original_address)
                    access_text = '-'

                    if args.dedupe_existing and row_exists(csv_path, clinic_name, store_name):
                        print(f"重複スキップ: {clinic_name} / {store_name}")
                        continue
                    store_id = generate_store_id(csv_path, clinic_name, args.url)

                    # 画像の保存
                    image_url = urljoin(args.url, card_img) if card_img else ''
                    brand_slug = brand_dir_from_store_id(store_id)
                    brand_dir = ensure_brand_dir_exists(brand_slug)
                    image_dest = brand_dir / f"{store_id}.webp"
                    if image_url and not args.dry_run:
                        try:
                            download_and_save_webp(image_url, image_dest)
                        except Exception as e:
                            print(f"画像保存に失敗: {e}")
                    csv_image_path = str(image_dest.as_posix()) if image_url else ''

                    csv_row = [store_id, clinic_name, store_name, zipcode, address_full, access_text, csv_image_path]
                    print('\n--- 汎用カード抽出（CSV行）---')
                    print(','.join(f'"{c}"' if ',' in (c or '') else (c or '') for c in csv_row))
                    if not args.dry_run:
                        append_csv_row(csv_path, csv_row)
                raise SystemExit(0)

        # 通常の単一ページ抽出
        result = scraper.extract_store_info(soup, args.url, store_name=args.store_name)

        # クリニック名（ブランド）決定: 明示が最優先、なければ og:site_name→抽出名（fallback）
        clinic_name = (args.clinic_name or '').strip()
        if not clinic_name:
            og_site = soup.find('meta', property='og:site_name')
            if og_site and og_site.get('content'):
                clinic_name = og_site['content'].strip()
        if not clinic_name:
            clinic_name = result.get('name', '').strip() or urlparse(args.url).hostname or ''

        # 店舗名（院名）: 明示最優先→抽出
        store_name = (args.store_name or '').strip() or result.get('name', '').strip()

        # 住所・郵便・アクセス
        original_address = (result.get('address') or '').strip()
        zipcode = extract_zipcode(original_address)
        address_full = remove_zip_from_address(original_address)
        access_text = safe_access_text(result.get('access'))

        # store_id生成
        store_id = generate_store_id(csv_path, clinic_name, args.url)

        # 画像URL抽出と保存
        image_url = extract_store_image_url(soup, args.url, clinic_name=clinic_name, store_name=store_name)
        brand_slug = brand_dir_from_store_id(store_id)
        brand_dir = ensure_brand_dir_exists(brand_slug)
        image_dest = brand_dir / f"{store_id}.webp"
        if image_url and not args.dry_run:
            try:
                download_and_save_webp(image_url, image_dest)
            except Exception as e:
                print(f"画像保存に失敗: {e}")
        csv_image_path = str(image_dest.as_posix()) if image_url else ''

        # 必須欠損チェック（最小）
        missing_fields = []
        if not clinic_name:
            missing_fields.append('clinic_name')
        if not store_name:
            missing_fields.append('store_name')

        # CSV行
        csv_row = [
            store_id,
            clinic_name,
            store_name,
            zipcode,
            address_full,
            access_text,
            csv_image_path,
        ]

        # 出力表示
        print("\n--- スクレイピング結果（CSV行）---")
        print(','.join(f'"{c}"' if ',' in (c or '') else (c or '') for c in csv_row))

        if args.confidence and 'confidence_scores' in result:
            print("\n--- 信頼度スコア ---")
            scores = result['confidence_scores']
            print(f"  店舗名:    {scores.get('name', 0):.1f}%")
            print(f"  住所: {scores.get('address', 0):.1f}%")
            print(f"  アクセス:  {scores.get('access', 0):.1f}%")
            print(f"  電話番号:   {scores.get('phone', 0):.1f}%")
            print(f"  営業時間:   {scores.get('hours', 0):.1f}%")
            print("  全体:      {:.1f}%".format(scores.get('overall', 0)))

        # 重複チェック
        if args.dedupe_existing and row_exists(csv_path, clinic_name, store_name):
            print("既存CSVに同一 (clinic_name, store_name) が存在するためスキップしました。")
        else:
            if args.dry_run:
                print("dry-runのためCSVへは書き込みません。")
            else:
                if missing_fields:
                    print(f"必須項目が欠損しているため追記をスキップしました: {', '.join(missing_fields)}")
                else:
                    append_csv_row(csv_path, csv_row)
                    print(f"追記しました → {csv_path}")

    except requests.exceptions.RequestException as e:
        print(f"\nURLの取得中にエラーが発生しました: {e}")
    except Exception as e:
        print(f"\nエラーが発生しました: {e}")