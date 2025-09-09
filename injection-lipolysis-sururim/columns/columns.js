// コラムセクションを外部管理して挿入
(function injectMedicalColumns() {
  var root = document.getElementById('medical-columns-root');
  if (!root) return;
  root.innerHTML = `
            <!-- 医療情報コラムセクション -->
            <section class=\"medical-columns-section\"> 
                <div class=\"columns-container\"> 
                    <!-- Main Article Card -->
                    <div class=\"article-card\"> 
                        <div class=\"article-header\"> 
                            <div class=\"article-title\"> 
                                医療痩身を始める前に知っておくべきこと 
                            </div> 
                            <div class=\"header-image\"> 
                                <img src=\"images/column.webp\" alt=\"医療痩身の基礎知識\" style=\"width: 100%; height: 100%; object-fit: cover;\"> 
                            </div> 
                        </div> 

                        <div class=\"article-subtitle\" style=\"margin: 8px 0 0; font-size: 0.95em; color: #666;\"> 
                            
                        </div> 

                        <!-- Table of Contents -->
                        <div class=\"toc-section\"> 
                            <div class=\"toc-title\">目次</div> 
                            <ul class=\"toc-list\"> 
                                <li class=\"toc-item\"> 
                                    <a href=\"#comparison\" class=\"toc-link\">医療痩身とエステ痩身の違い</a> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#mechanism\" class=\"toc-link\">医療痩身とエステ痩身の仕組み</a> 
                                    </div> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#merits\" class=\"toc-link\">医療痩身とエステ痩身メリット・デメリット</a> 
                                    </div> 
                                </li> 
                                <li class=\"toc-item\"> 
                                    <a href=\"#risks\" class=\"toc-link\">医療痩身に伴うリスクや副作用</a> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#side-effects\" class=\"toc-link\">医療痩身で起こりうる副作用</a> 
                                    </div> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#pain\" class=\"toc-link\">医療痩身の痛みについて</a> 
                                    </div> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#precautions\" class=\"toc-link\">施術前にやってはいけないこと</a> 
                                    </div> 
                                </li> 
                                <li class=\"toc-item\"> 
                                    <a href=\"#contract\" class=\"toc-link\">医療痩身を契約する時の注意点</a> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#insurance\" class=\"toc-link\">医療痩身は保険適用外</a> 
                                    </div> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#details\" class=\"toc-link\">施術内容について細かく確認する</a> 
                                    </div> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#additional-fees\" class=\"toc-link\">後出しでの追加費用がかからないか確認</a> 
                                    </div> 
                                    <div class=\"toc-sub-item\"> 
                                        <a href=\"#troubles\" class=\"toc-link\">それでもトラブルになってしまったら</a> 
                                    </div> 
                                </li> 
                            </ul> 
                        </div> 
                    </div> 

                    <!-- Sururim: まずは中身で判断する -->
                    <div class=\"article-card\"> 
                        <div class=\"content-section\"> 
                            <div class=\"section-title\">スルリム注射って実際どう？評価が分かれる理由</div> 
                            <div class=\"section-content\"> 
                                スルリムは“施術名（ブランド名）”であり、実際の薬剤の成分濃度や配合は院ごとに異なる場合があります。特に、デオキシコール酸の濃度や1エリアあたりの注入量（何cc）が非公開のケースでは、効果の見込みや費用対効果を事前に比較しづらく、満足度にばらつきが生じやすくなります。 
                            </div> 
                            <ul class=\"merits-list\" style=\"margin-top:8px;\"> 
                                <li>名称よりも“中身の透明性”（濃度・cc）が重要</li> 
                                <li>エリア料金のみの表記は比較が難しい</li> 
                                <li>濃度・ccの数字を確認できるプランを優先</li> 
                            </ul> 
                        </div> 
                        <div class=\"content-section\"> 
                            <div class=\"section-title\">本当に見るべきは“名前”ではなく“中身”—デオキシコール酸の濃度</div> 
                            <div class=\"section-content\"> 
                                脂肪溶解注射の主流は、脂肪細胞に作用する「デオキシコール酸」を含む薬剤。一般に、デオキシコール酸は濃度が高いほど脂肪細胞への作用が強く、回数や変化量に影響しやすい一方、腫れ・熱感などのダウンタイムも強く出る傾向があります。効果やダウンタイムのバランスを踏まえつつ、自分の体質や希望に合わせて最適な濃度や量を相談できるクリニックを選ぶのがおすすめです。 
                            </div> 
                            <ul class=\"merits-list\" style=\"margin-top:8px;\"> 
                                <li>高濃度系（例：FatX系）… 目安1.0%前後：作用強・DTも強め</li> 
                                <li>中濃度系（例：Kabelline）… 目安0.5%：バランス型</li> 
                                <li>名称系（例：スルリムなど）… 濃度・注入量が非公開なことが多い</li> 
                            </ul> 
                        </div> 
                        <div class=\"content-section\"> 
                            <div class=\"section-title\">編集部の見解（要約）</div> 
                            <ul class=\"merits-list\"> 
                                <li>デオキシコール酸の濃度が高いクリニックを選ぶ</li> 
                                <li>個人に合わせたカスタマイズできるプランがあるか</li> 
                                <li>リバウンドのしにくさなどの実績が豊富なクリニック</li> 
                            </ul> 
                        </div> 
                        <div class=\"content-section\"> 
                            <div class=\"section-title\">失敗しない選び方3ポイント</div> 
                            <div class=\"tips-precautions-list\"> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">1. 濃度が明確か</div> 
                                    <div class=\"section-content\"> 
                                        デオキシコール酸が何％かを確認。0.5%以上を目安に、選択肢として1.0%前後の高濃度も相談できるとベター。 
                                    </div> 
                                </div> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">2. cc単価で比較</div> 
                                    <div class=\"section-content\"> 
                                        顔は1〜5cc、体は10〜20ccが目安。1ccあたりの料金が分かると総額試算がしやすい。追加費用（初診/再診/麻酔/薬）も確認。 
                                    </div> 
                                </div> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">3. カウンセリングで“数字”と“リスク説明”まで</div> 
                                    <div class=\"section-content\"> 
                                        「何％？」「何cc入る？」の2問は必ず。濃度が上がるほど腫れ・熱感・内出血の負担も増え得るため、説明と代替案（脂肪冷却・EMS等）の提案力も重視。 
                                    </div> 
                                </div> 
                            </div> 
                        </div> 
                    </div> 

                    <!-- Comparison: Mouthpiece vs Wire Orthodontics -->
                    <div class=\"article-card\"> 
                        <div class=\"content-section\" id=\"comparison\"> 
                            <div class=\"section-title\">医療痩身とエステ痩身の違い</div> 
                            <div class=\"section-content\"> 
                                「痩身」には、大きく分けて「医療痩身」と「エステ痩身（美容痩身・エステサロン）」の<span style=\"background-color: #fff3cd; padding: 2px 4px;\">2種類があります</span>。それぞれの仕組みやメリット・デメリットを理解して、どちらが自分に適しているか判断するようにしましょう。 
                            </div> 

                            <table class=\"comparison-table\"> 
                                <thead class=\"table-header\"> 
                                    <tr class=\"table-row\"> 
                                        <th></th> 
                                        <th>医療痩身</th> 
                                        <th>エステ痩身</th> 
                                    </tr> 
                                </thead> 
                                <tbody> 
                                    <tr class=\"table-row\"> 
                                        <td class=\"row-header\">施術の目的</td> 
                                        <td>医療行為に基づく痩身効果の提供</td> 
                                        <td>リラクゼーションや一時的なサイズダウン</td> 
                                    </tr> 
                                    <tr class=\"table-row\"> 
                                        <td class=\"row-header\">施術者</td> 
                                        <td>医師・看護師などの医療従事者</td> 
                                        <td>エステティシャン</td> 
                                    </tr> 
                                    <tr class=\"table-row\"> 
                                        <td class=\"row-header\">施術内容</td> 
                                        <td>HIFU、脂肪溶解注射、脂肪冷却など</td> 
                                        <td>マッサージ、キャビテーション、ラジオ波など</td> 
                                    </tr> 
                                    <tr class=\"table-row\"> 
                                        <td class=\"row-header\">効果</td> 
                                        <td>医学的根拠に基づく継続的な効果が期待できる</td> 
                                        <td>一時的な効果に留まることが多い</td> 
                                    </tr> 
                                    <tr class=\"table-row\"> 
                                        <td class=\"row-header\">安全性</td> 
                                        <td>医療従事者による管理のもとで実施</td> 
                                        <td>医療資格が不要のため安全性にばらつき</td> 
                                    </tr> 
                                </tbody> 
                            </table> 
                        </div> 
                    </div> 

                    <!-- Mechanism -->
                    <div class=\"article-card\"> 
                        <div class=\"content-section\" id=\"mechanism\"> 
                            <div class=\"section-title\">医療痩身とエステ痩身の仕組み</div> 
                            <div class=\"section-content\"> 
                                医療痩身とエステ痩身の施術は、目的や体への作用の仕方が異なります。 
                            </div> 
                            <div class=\"section-content\"> 
                                医療痩身では主に脂肪細胞そのものを減らす治療が行われるため、<span style=\"background-color: #fff3cd; padding: 2px 4px;\">リバウンドのリスクを軽減しやすい</span>という特徴があります。一方、エステ痩身では主に血行促進や老廃物の排出を促すことが目的で、サイズダウンは期待できますが、<span style=\"background-color: #fff3cd; padding: 2px 4px;\">脂肪細胞の数自体は減らない</span>ため、効果の持続には個人差があります。 
                            </div> 
                        </div> 
                    </div> 

                    <!-- Merits and Demerits -->
                    <div class=\"article-card\"> 
                        <div class=\"content-section\" id=\"merits\"> 
                            <div class=\"section-title\">医療痩身とエステ痩身メリット・デメリット</div> 
                            <div class=\"section-content\"> 
                                それぞれの特徴と向いている人の傾向を把握して、自分の目標やライフスタイルに合った方法を選びましょう。 
                            </div> 
                            <div class=\"tips-merits-container\"> 
                                <div class=\"tips-merits-card\"> 
                                    <div class=\"merits-title\">医療痩身のメリット</div> 
                                    <ul class=\"merits-list\"> 
                                        <li>医学的根拠に基づく治療で高い効果が期待できる</li> 
                                        <li>脂肪細胞を直接減らす治療が可能</li> 
                                        <li>医師による診察・管理のもとで安全に施術が行われる</li> 
                                        <li>短期間で結果が出やすい</li> 
                                    </ul> 
                                </div> 
                                <div class=\"tips-merits-card\"> 
                                    <div class=\"merits-title\">医療痩身のデメリット</div> 
                                    <ul class=\"merits-list\"> 
                                        <li>費用が高くなることがある</li> 
                                        <li>副作用やダウンタイムが発生することがある</li> 
                                        <li>施術の内容によっては痛みを伴う場合がある</li> 
                                    </ul> 
                                </div> 
                                <div class=\"tips-merits-card\"> 
                                    <div class=\"merits-title\">エステ痩身のメリット</div> 
                                    <ul class=\"merits-list\"> 
                                        <li>リラクゼーション効果がある</li> 
                                        <li>比較的費用が抑えられることがある</li> 
                                        <li>ダウンタイムがほとんどない</li> 
                                    </ul> 
                                </div> 
                                <div class=\"tips-merits-card\"> 
                                    <div class=\"merits-title\">エステ痩身のデメリット</div> 
                                    <ul class=\"merits-list\"> 
                                        <li>効果に個人差が大きく、継続が必要な場合がある</li> 
                                        <li>脂肪細胞自体の数は減らない</li> 
                                        <li>施術者の技術やサロンの品質によって効果が左右される</li> 
                                    </ul> 
                                </div> 
                            </div> 
                        </div> 
                    </div> 

                    <!-- Risks and Side Effects -->
                    <div class=\"article-card\"> 
                        <div class=\"content-section\" id=\"risks\"> 
                            <div class=\"section-title\">医療痩身に伴うリスクや副作用</div> 
                            <div class=\"section-content\"> 
                                医療痩身は医療機器や薬剤を使用する施術が含まれるため、一定のリスクや副作用が伴う可能性があります。施術を受ける前に、必ず医師とよく相談し、納得した上で契約するようにしましょう。 
                            </div> 
                        </div> 
                        <div class=\"header-image\" style=\"margin-top: 10px;\"> 
                            <img src=\"images/column2.webp\" alt=\"医療痩身の副作用について\" style=\"width: 100%; height: 100%; object-fit: cover;\" loading=\"lazy\"> 
                        </div> 
                        <div class=\"content-section\" id=\"side-effects\"> 
                            <div class=\"section-title\">医療痩身で起こりうる副作用</div> 
                            <div class=\"section-content\"> 
                                医療痩身に含まれる主な施術で起こりやすい副作用として、以下のようなものが挙げられます。 
                            </div> 
                            <div class=\"tips-side-effects-container\"> 
                                <div class=\"tips-side-effects-card\"> 
                                    <div class=\"subsection-title\">内出血・腫れ</div> 
                                    <div class=\"section-content\"> 
                                        脂肪溶解注射やHIFUなどの施術後に、処置部位の内出血や腫れが発生することがあります。通常は数日〜1週間程度で軽快します。 
                                    </div> 
                                </div> 
                                <div class=\"tips-side-effects-card\"> 
                                    <div class=\"subsection-title\">痛み・筋肉痛</div> 
                                    <div class=\"section-content\"> 
                                        電磁場EMSやHIFUなどの刺激が強い施術では、筋肉痛のような痛みが数日続くことがあります。 
                                    </div> 
                                </div> 
                                <div class=\"tips-side-effects-card\"> 
                                    <div class=\"subsection-title\">皮膚のたるみ</div> 
                                    <div class=\"section-content\"> 
                                        急激に脂肪が減少することで、皮膚が一時的にたるんで見えることがあります。継続的なケアで改善が見込めます。 
                                    </div> 
                                </div> 
                                <div class=\"tips-side-effects-card\"> 
                                    <div class=\"subsection-title\">凹凸・左右差</div> 
                                    <div class=\"section-content\"> 
                                        脂肪冷却などの施術後に、まれに皮膚表面が凹凸に見えることがあります。施術技術や体質による影響もあるため、事前に医師と相談しておきましょう。 
                                    </div> 
                                </div> 
                            </div> 
                            <div class=\"section-content\"> 
                                いずれの施術でも、<span style=\"background-color: #fff3cd; padding: 2px 4px;\">副作用には個人差がある</span>ため、体調や既往歴に応じて施術の可否やリスクを判断する必要があります。 
                            </div> 
                        </div> 
                        <div class=\"content-section\" id=\"pain\"> 
                            <div class=\"section-title\">医療痩身の痛みについて</div> 
                            <div class=\"section-content\"> 
                                医療痩身の痛みは、施術内容によって大きく異なります。多くの場合、施術中や施術直後に一時的な痛みや違和感を感じることがありますが、適切なケアを行えば、通常は短期間で改善します。 
                            </div> 
                        </div> 
                        <div class=\"content-section\" id=\"precautions\"> 
                            <div class=\"section-title\">施術前にやってはいけないこと</div> 
                            <div class=\"tips-precautions-list\"> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">極端な食事制限</div> 
                                    <div class=\"section-content\"> 
                                        急激な食事制限は体調を崩す原因となるため、施術前後はバランスの取れた食事を心がけましょう。 
                                    </div> 
                                </div> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">アルコール摂取</div> 
                                    <div class=\"section-content\"> 
                                        施術前日の過度なアルコール摂取は、体への負担や施術時のリスクを高める可能性があります。 
                                    </div> 
                                </div> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">激しい運動</div> 
                                    <div class=\"section-content\"> 
                                        施術直前の激しい運動は、体に過度な負担をかける恐れがあります。施術前後は無理のない範囲で活動しましょう。 
                                    </div> 
                                </div> 
                            </div> 
                        </div> 
                    </div> 

                    <!-- Contract Cautions -->
                    <div class=\"article-card\"> 
                        <div class=\"highlight-box\" id=\"contract\"> 
                            <div class=\"section-title\">医療痩身を契約する時の注意点</div> 
                            <div class=\"header-image\" style=\"margin-top: 10px;\"> 
                                <img src=\"images/column3.webp\" alt=\"医療痩身契約の注意点\" style=\"width: 100%; height: 100%; object-fit: cover;\" loading=\"lazy\"> 
                            </div> 
                            <div class=\"content-section\" id=\"insurance\"> 
                                <div class=\"section-title\">医療痩身は保険適用外</div> 
                                <div class=\"section-content\"> 
                                    「医療痩身は、医療行為だから保険が適用される」と考えている人が多いですが、ほとんどの場合、医療痩身は保険が適用されません。 
                                </div> 
                                <div class=\"section-content\"> 
                                    医療痩身の主な目的は美容目的であることが多いため、保険が適用されない自由診療に分類されます。<span style=\"background-color: #fff3cd; padding: 2px 4px;\">全額自費負担</span>となる点を理解し、契約前に総額や追加費用を必ず確認しましょう。 
                                </div> 
                            </div> 
                        </div> 
                    </div> 

                    <div class=\"article-card\"> 
                        <div class=\"highlight-box\" id=\"details\"> 
                            <div class=\"section-title\">施術内容について細かく確認する</div> 
                            <div class=\"section-content\"> 
                                医療痩身を契約するときは、施術内容について細かく確認しましょう。クリニックごとに様々なプランやメニューがあるため、自分の目的に沿っているかどうか判断する必要があります。 
                            </div> 
                            <div class=\"section-content\" style=\"margin-top: 12px;\"> 
                                例えば「二の腕痩せ」と言っても、脂肪冷却のみのプランもあれば、HIFUや脂肪溶解注射を組み合わせたプランもあります。契約後の変更で追加料金が発生することもあるため、<span style=\"background-color: #fff3cd; padding: 2px 4px;\">契約前に施術内容をしっかり確認</span>しておきましょう。 
                            </div> 
                        </div> 
                    </div> 

                    <!-- Additional Fees -->
                    <div class=\"article-card\"> 
                        <div class=\"highlight-box\" id=\"additional-fees\"> 
                            <div class=\"section-title\">後出しでの追加費用がかからないか確認する</div> 
                            <div class=\"section-content\"> 
                                医療痩身の契約時には、追加の費用についても確認するようにしましょう。提示された料金とは別に、予想外の追加費用がかかってしまう可能性もあります。 
                            </div> 
                            <div class=\"section-content\" style=\"margin-top: 12px;\"> 
                                追加費用が掛かる項目として、代表的なものは以下の通りです。 
                            </div> 

                            <ul class=\"fee-list\"> 
                                <li class=\"fee-item\">麻酔代</li> 
                                <li class=\"fee-item\">初診料・カウンセリング料</li> 
                                <li class=\"fee-item\">キャンセル代</li> 
                                <li class=\"fee-item\">追加施術料</li> 
                                <li class=\"fee-item\">アフターケア商品代</li> 
                            </ul> 

                            <div class=\"section-content\"> 
                                特に麻酔代はクリニックにより異なります。追加費用については、契約前に必ず確認するようにしてください。 
                            </div> 
                        </div> 
                    </div> 

                    <!-- Troubleshooting -->
                    <div class=\"article-card\"> 
                        <div class=\"highlight-box\" id=\"troubles\"> 
                            <div class=\"section-title\">それでもトラブルになってしまったら</div> 
                            <div class=\"section-content\"> 
                                万が一、医療痩身の契約についてトラブルになってしまった場合は、以下の窓口に相談することが可能です。 
                            </div> 

                            <ul class=\"contact-list\"> 
                                <li class=\"contact-item\"> 
                                    <i class=\"fas fa-phone\"></i> 
                                    <a href=\"https://www.anzen-shien.jp/center/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"contact-link\" style=\"position: relative; z-index: 10; display: inline-block;\">医療安全支援センター（医療に関する苦情・心配事の相談）</a> 
                                </li> 
                                <li class=\"contact-item\"> 
                                    <i class=\"fas fa-phone\"></i> 
                                    <a href=\"https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"contact-link\" style=\"position: relative; z-index: 10; display: inline-block;\">消費者ホットライン（契約内容や契約条件など、契約に関する相談）</a> 
                                </li> 
                                <li class=\"contact-item\"> 
                                    <i class=\"fas fa-phone\"></i> 
                                    <a href=\"https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"contact-link\" style=\"position: relative; z-index: 10; display: inline-block;\">医療相談窓口（医療に関する広告についての相談）</a> 
                                </li> 
                            </ul> 
                        </div> 
                    </div> 

                    <!-- FAQ -->
                    <div class=\"article-card\"> 
                        <div class=\"content-section\"> 
                            <div class=\"section-title\">よくある質問（FAQ）</div> 
                            <div class=\"tips-precautions-list\"> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">Q. 何回で効果を実感できますか？</div> 
                                    <div class=\"section-content\"> 
                                        個人差があります。中〜高濃度で2〜4回目に実感する声が多い一方、部位や脂肪量で変動します。顔は少量・回数多め、体はcc多めが目安です。 
                                    </div> 
                                </div> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">Q. ダウンタイムはどのくらい？</div> 
                                    <div class=\"section-content\"> 
                                        腫れ・熱感・内出血が数日〜1週間程度。高濃度ほど強く出る傾向があります。大事な予定前は低〜中濃度や他施術（脂肪冷却・HIFU等）も検討を。 
                                    </div> 
                                </div> 
                                <div class=\"precautions-item\"> 
                                    <div class=\"subsection-title\">Q. リバウンドしますか？</div> 
                                    <div class=\"section-content\"> 
                                        脂肪細胞に作用するため起こりにくいとされますが、生活習慣次第です。水分摂取・飲酒制限等のアフターケアで体外排出を促しましょう。 
                                    </div> 
                                </div> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
            </section> 
  `;
})();
