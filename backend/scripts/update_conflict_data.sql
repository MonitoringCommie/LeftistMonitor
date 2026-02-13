-- =============================================================================
-- UPDATE CONFLICT DATA: Casualties, Progressive Analysis, and Outcomes
-- For major historical conflicts in the leftist_monitor database
-- Generated 2026-02-12
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- KOREAN WAR (1950-1953)
-- Total deaths: ~2.5-4 million (military + civilian)
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 2500000,
    casualties_high = 4000000,
    progressive_analysis = 'The Korean War was a catastrophic proxy conflict in which U.S. imperialism, under the guise of "containing communism," devastated the Korean peninsula, killing millions of civilians through carpet bombing and napalm campaigns that destroyed nearly every major city in the North. The war entrenched a Cold War division that served American geopolitical interests while Korean working people on both sides bore the overwhelming cost, with class-based land reform movements in the South brutally suppressed by the U.S.-backed Rhee dictatorship.',
    outcome = 'The war ended in an armistice in 1953 with no formal peace treaty, leaving Korea divided at the 38th parallel. The devastation was immense: North Korea lost roughly 12-15% of its population, and the peninsula remains divided and militarized to this day.'
WHERE name ILIKE '%Korean War%'
  AND name NOT ILIKE '%nuclear%'
  AND name NOT ILIKE '%Navy%'
  AND name NOT ILIKE '%invasion of Manchuria%'
  AND name NOT ILIKE '%exercise%';

-- -----------------------------------------------------------------------------
-- VIETNAM WAR (1955-1975)
-- Total deaths: ~1.5-3.6 million
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 1500000,
    casualties_high = 3600000,
    progressive_analysis = 'The Vietnam War stands as one of the defining anti-imperialist struggles of the 20th century, in which a colonized peasant nation defeated first French and then American imperialism through revolutionary guerrilla warfare and mass popular mobilization. The U.S. waged a war of attrition against the Vietnamese people, deploying chemical weapons (Agent Orange), carpet bombing, and counterinsurgency programs like the Phoenix Program that targeted civilians, all to prevent the self-determination of a people seeking liberation from colonial exploitation and feudal landlordism.',
    outcome = 'North Vietnamese and Viet Cong forces achieved total victory with the fall of Saigon in April 1975, reunifying Vietnam under socialist governance. The war demonstrated that a determined liberation movement backed by popular support could defeat the most powerful military in the world.'
WHERE name = 'Vietnam War';

-- Also update the year-specific Vietnam War entries
UPDATE conflicts
SET casualties_low = NULL,
    casualties_high = NULL,
    progressive_analysis = 'Part of the broader Vietnamese struggle against American imperialism, this phase of the conflict reflected the escalating U.S. military commitment to suppressing a popular national liberation movement rooted in anti-colonial and class-based grievances against feudal landlords and foreign domination.',
    outcome = 'Continued escalation of the conflict that would ultimately end in American defeat and Vietnamese reunification in 1975.'
WHERE name LIKE '%in the Vietnam War'
  AND casualties_low IS NULL
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- SOVIET-AFGHAN WAR (1979-1989)
-- Total deaths: ~1-2 million (mostly Afghan civilians)
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 1000000,
    casualties_high = 2000000,
    progressive_analysis = 'The Soviet-Afghan War became a devastating Cold War proxy conflict in which the United States cynically armed and funded mujahideen fundamentalists — including precursors to al-Qaeda and the Taliban — to bleed the Soviet Union, with catastrophic long-term consequences for the Afghan people. While the Soviet intervention was itself a flawed attempt to prop up a modernizing but authoritarian government, the CIA''s Operation Cyclone weaponized religious extremism against progressive reforms including women''s education and land redistribution, sacrificing Afghan civilians as pawns in a geopolitical chess match.',
    outcome = 'Soviet forces withdrew in 1989 after a decade of grinding guerrilla warfare that killed over a million Afghans and displaced five million as refugees. The withdrawal precipitated the collapse of the Afghan communist government and plunged the country into civil war, ultimately leading to Taliban rule.'
WHERE name IN ('Soviet-Afghan War', 'Afghan-Soviet War');

-- -----------------------------------------------------------------------------
-- GULF WAR / IRAQ WAR
-- Gulf War (1990-1991): ~25,000-40,000 deaths
-- Iraq War (2003-2011+): ~150,000-1,000,000 deaths
-- -----------------------------------------------------------------------------

-- Gulf War itself is likely captured under various names
UPDATE conflicts
SET casualties_low = 25000,
    casualties_high = 40000,
    progressive_analysis = 'The Gulf War established the template for U.S. imperial intervention in the post-Cold War era, as American forces devastated Iraqi infrastructure through massive aerial bombardment that disproportionately harmed working-class Iraqi civilians. The war served the interests of oil capital and the U.S. military-industrial complex while being marketed as a humanitarian intervention, and the subsequent sanctions regime killed hundreds of thousands of Iraqi children through deliberate deprivation of food and medicine.',
    outcome = 'A decisive U.S.-led coalition military victory expelled Iraqi forces from Kuwait, but the war''s aftermath — including devastating sanctions, no-fly zones, and continued military operations — caused far more civilian suffering than the war itself and laid the groundwork for the 2003 invasion.'
WHERE name ILIKE '%Gulf War%'
  AND name NOT ILIKE '%United Nations%';

-- Iraq War (2003 invasion and occupation)
UPDATE conflicts
SET casualties_low = 150000,
    casualties_high = 1000000,
    progressive_analysis = 'The Iraq War was an illegal war of aggression launched on fabricated pretexts (nonexistent WMDs) that served the interests of U.S. hegemony, oil corporations, and the military-industrial complex, resulting in the destruction of Iraqi society, the deaths of hundreds of thousands of civilians, and the displacement of millions. The occupation dismantled Iraq''s state institutions, privatized its economy for foreign capital, and deliberately stoked sectarian divisions through divide-and-rule tactics, transforming a functioning state into a failed one while enriching defense contractors like Halliburton.',
    outcome = 'The U.S. formally withdrew combat troops in 2011 after failing to establish a stable client state. The war destabilized the entire region, directly spawning ISIS, and left Iraq with shattered infrastructure, sectarian divisions, and ongoing violence that continues to this day.'
WHERE name IN ('Iraq War', '2003 invasion of Iraq', 'US-led intervention in Iraq', 'occupation of Iraq', 'The Occupation of Iraq', 'Iraq War and the war on terror');

-- Iraqi Civil War (2006-2008) and insurgency
UPDATE conflicts
SET casualties_low = 100000,
    casualties_high = 250000,
    progressive_analysis = 'The Iraqi Civil War was a direct consequence of the U.S. imperial invasion and occupation, which dismantled state institutions, dissolved the Iraqi army, and imposed a sectarian political system that pitted Sunni and Shia working people against each other. The violence served to justify continued U.S. military presence while foreign corporations extracted Iraqi oil wealth.',
    outcome = 'The civil war subsided after the 2007-2008 U.S. troop surge and Sunni Awakening movement, but left deep sectarian scars and a weakened Iraqi state vulnerable to the later rise of ISIS.'
WHERE name IN ('Iraqi Civil War of 2006–2008');

-- Iranian-Iraqi War
UPDATE conflicts
SET casualties_low = 500000,
    casualties_high = 1500000,
    progressive_analysis = 'The Iran-Iraq War was one of the bloodiest conflicts of the late 20th century, in which Western imperialist powers — particularly the United States — cynically armed both sides to prolong the slaughter, while providing Saddam Hussein with chemical weapons precursors and intelligence used in attacks on Iranian troops and Kurdish civilians. The war served Western interests by containing both the Iranian Revolution and Iraqi regional ambitions, consuming the resources and lives of two oil-rich nations whose people paid the price for superpower machinations.',
    outcome = 'The war ended in a UN-brokered ceasefire in 1988 with no territorial changes, making it a devastating stalemate that killed up to 1.5 million people and bankrupted both nations. Iraq''s subsequent debt crisis directly contributed to its invasion of Kuwait and the cycle of further wars.'
WHERE name IN ('Iran–Iraq War', 'Iran-Iraq War');

-- -----------------------------------------------------------------------------
-- SYRIAN CIVIL WAR (2011-present)
-- Total deaths: ~500,000-660,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 500000,
    casualties_high = 660000,
    progressive_analysis = 'The Syrian Civil War began as a popular uprising against authoritarian rule but was rapidly transformed into a devastating proxy war in which multiple imperial powers — the U.S., Russia, Turkey, Saudi Arabia, and Iran — pursued their geopolitical interests at the expense of the Syrian people. Western intervention armed jihadist proxies while Russia and Iran backed the Assad regime''s barrel-bombing of civilian areas, creating a catastrophic humanitarian crisis that displaced half the population and destroyed a functioning society, all while the working class bore the brunt of the violence regardless of which faction controlled their territory.',
    outcome = 'The Assad regime, backed by Russian and Iranian military intervention, regained control of most of the country by 2020, though the conflict continued at lower intensity. Over 13 million Syrians were displaced, half the country''s infrastructure was destroyed, and in late 2024 a renewed opposition offensive led to Assad''s ouster.'
WHERE name IN ('Syrian Civil War')
   OR name ILIKE 'Syrian civil war'
   AND name NOT ILIKE '%early%'
   AND name NOT ILIKE '%escalation%'
   AND name NOT ILIKE '%spillover%';

-- Also update the sub-entries
UPDATE conflicts
SET progressive_analysis = 'This phase of the Syrian conflict demonstrated how imperial powers exploited a genuine popular uprising to advance their own strategic interests, with the U.S. and Gulf states arming opposition factions while Russia escalated its military intervention, turning Syria into a battlefield for competing imperial ambitions at the cost of civilian lives.',
    outcome = 'Continued escalation transformed the initial uprising into a multi-sided international proxy war involving dozens of state and non-state actors.'
WHERE name IN ('2012–2013 escalation of the Syrian civil war', 'early insurgency phase of the Syrian Civil War', 'spillover of the Syrian Civil War')
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- YEMENI CIVIL WAR (2014-present)
-- Total deaths: ~150,000-377,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 150000,
    casualties_high = 377000,
    progressive_analysis = 'The Yemeni Civil War has produced what the UN called the world''s worst humanitarian crisis, as a Saudi-led coalition armed and supported by the United States and United Kingdom waged a devastating air campaign that systematically targeted civilian infrastructure including hospitals, schools, and water treatment facilities. The war exposed the complicity of Western arms manufacturers and governments in mass civilian casualties, while the naval blockade created famine conditions that killed tens of thousands of children — a deliberate strategy of collective punishment targeting the poorest nation in the Arab world.',
    outcome = 'The conflict created a catastrophic humanitarian emergency with an estimated 377,000 deaths by 2022, the majority from indirect causes like famine and disease. A fragile truce was reached in 2022, but the underlying political divisions remain unresolved and the country''s infrastructure is devastated.'
WHERE name IN ('Yemeni civil war', 'Yemen Civil War')
   OR name ILIKE 'Yemeni Civil War%';

-- North Yemen Civil War
UPDATE conflicts
SET casualties_low = 100000,
    casualties_high = 200000,
    progressive_analysis = 'The North Yemen Civil War was a Cold War proxy conflict in which Egypt backed the republican revolutionaries against a Saudi-supported royalist monarchy, reflecting broader regional struggles between Arab nationalist modernization movements and conservative monarchical reaction backed by Western interests. Egyptian intervention under Nasser represented an attempt to export the anti-feudal revolution, while Saudi and British support for the royalists aimed to preserve the reactionary monarchical order.',
    outcome = 'The war ended with the establishment of the Yemen Arab Republic after Egyptian withdrawal, representing a partial victory for the republican movement though the resulting state remained vulnerable to tribal and regional divisions.'
WHERE name = 'North Yemen civil war'
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- ETHIOPIAN CIVIL WAR / TIGRAY WAR
-- Ethiopian Civil War: ~500,000-1,500,000
-- Tigray War (2020-2022): ~300,000-800,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 500000,
    casualties_high = 1500000,
    progressive_analysis = 'The Ethiopian Civil War reflected the contradictions of a revolutionary movement that, while overthrowing a feudal monarchy and implementing land reform, ultimately degenerated into authoritarian rule under the Derg military junta, which pursued forced collectivization and political repression through the Red Terror. The subsequent multi-sided conflict exposed how genuine revolutionary aspirations can be subverted when revolutionary power becomes divorced from democratic popular control, with the peasantry and working class suffering the consequences of elite power struggles.',
    outcome = 'The EPRDF coalition overthrew the Derg in 1991 after a protracted guerrilla war, establishing a new federal system based on ethnic federalism. The war left hundreds of thousands dead from combat, famine, and political repression.'
WHERE name IN ('Ethiopian Civil War', 'Ethiopian Revolution');

-- Tigray War
UPDATE conflicts
SET casualties_low = 300000,
    casualties_high = 800000,
    progressive_analysis = 'The Tigray War was one of the deadliest conflicts of the 21st century, characterized by deliberate starvation tactics, systematic sexual violence, and ethnic cleansing carried out by Ethiopian federal forces, Eritrean troops, and Amhara militias against the Tigrayan population. The conflict exposed how ethnic federalism, originally designed to address national self-determination, became a tool of inter-elite competition, while Western powers largely ignored the mass atrocities due to Ethiopia''s strategic importance as a regional counterterrorism partner.',
    outcome = 'A cessation of hostilities agreement was signed in November 2022, but not before an estimated 300,000-800,000 people had died from violence, famine, and lack of medical care. The humanitarian impact was catastrophic, with millions displaced and widespread destruction of infrastructure.'
WHERE name IN ('Siege of Tigray')
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- RWANDAN CIVIL WAR / GENOCIDE (1990-1994)
-- Total deaths: ~500,000-1,000,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 500000,
    casualties_high = 1000000,
    progressive_analysis = 'The Rwandan Genocide was the culmination of colonial divide-and-rule policies in which Belgian colonialism institutionalized ethnic categories between Hutu and Tutsi, transforming fluid social distinctions into rigid racial hierarchies to facilitate exploitation. The genocide was enabled by decades of Western-backed authoritarian rule, French military support for the Habyarimana regime, and the deliberate failure of the UN and Western powers to intervene despite clear warnings — a failure rooted in the imperial calculus that African lives were expendable when no strategic interests were at stake.',
    outcome = 'An estimated 800,000 Tutsi and moderate Hutu were massacred in approximately 100 days, making it one of the most intensive genocides in history. The RPF military victory ended the genocide but triggered a refugee crisis and subsequent conflicts in the Democratic Republic of Congo.'
WHERE name IN ('Rwandan Civil War', 'Rwandan Civil War & Genocide');

-- -----------------------------------------------------------------------------
-- ANGOLAN CIVIL WAR (1975-2002)
-- Total deaths: ~500,000-1,500,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 500000,
    casualties_high = 1500000,
    progressive_analysis = 'The Angolan Civil War was a protracted Cold War proxy conflict in which the United States and apartheid South Africa backed UNITA against the MPLA government, prolonging a devastating war for decades to prevent the consolidation of a socialist-aligned state in resource-rich southern Africa. The cynical alliance between the CIA and the apartheid regime against a national liberation movement that had fought Portuguese colonialism exposed the hypocrisy of Western claims to support democracy and human rights, while Angola''s oil and diamond wealth fueled the conflict and enriched foreign corporations and arms dealers.',
    outcome = 'The war ended in 2002 with the death of UNITA leader Jonas Savimbi and the military victory of the MPLA government. After 27 years of conflict, over 500,000 were dead, 4 million displaced, and the country''s infrastructure was devastated, though Angola''s oil wealth enabled postwar reconstruction under continued MPLA rule.'
WHERE name = 'Angolan Civil War';

-- -----------------------------------------------------------------------------
-- MOZAMBICAN CIVIL WAR (1977-1992)
-- Total deaths: ~600,000-1,000,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 600000,
    casualties_high = 1000000,
    progressive_analysis = 'The Mozambican Civil War was a deliberate destabilization campaign in which apartheid South Africa and Rhodesia created, armed, and directed RENAMO as a proxy force to destroy the socialist FRELIMO government that had won independence from Portuguese colonialism. RENAMO systematically targeted civilian infrastructure — schools, health clinics, and agricultural projects — specifically to undermine FRELIMO''s social programs, making the war a direct assault by white supremacist regimes on African self-determination and socialist development.',
    outcome = 'The Rome General Peace Accords of 1992 ended the war, with RENAMO transitioning into a political party. The conflict killed up to one million people, most from famine and disease caused by the deliberate destruction of food systems and infrastructure, and displaced five million — nearly a third of the population.'
WHERE name = 'Mozambican Civil War';

-- -----------------------------------------------------------------------------
-- SALVADORAN CIVIL WAR (1979-1992)
-- Total deaths: ~70,000-80,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 70000,
    casualties_high = 80000,
    progressive_analysis = 'The Salvadoran Civil War was a class war in which the U.S.-backed oligarchic state and its military death squads waged a campaign of terror against peasant organizations, trade unions, liberation theology movements, and the FMLN guerrilla coalition that sought land reform and social justice. The United States poured over $6 billion into the Salvadoran military despite systematic human rights abuses including the assassination of Archbishop Romero, the rape and murder of American churchwomen, and the El Mozote massacre, demonstrating that anti-communism trumped any concern for human rights in U.S. foreign policy.',
    outcome = 'The Chapultepec Peace Accords of 1992 ended the war with significant reforms including military restructuring, a new civilian police force, and political inclusion of the FMLN as a legal party. Over 75,000 were killed, with the UN Truth Commission finding that 85% of abuses were committed by state forces and allied death squads.'
WHERE name = 'Salvadoran Civil War';

-- -----------------------------------------------------------------------------
-- GUATEMALAN CIVIL WAR (1960-1996)
-- Total deaths: ~140,000-200,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 140000,
    casualties_high = 200000,
    progressive_analysis = 'The Guatemalan Civil War was rooted in the 1954 CIA-orchestrated coup that overthrew the democratically elected Arbenz government to protect United Fruit Company profits, replacing progressive land reform with decades of military dictatorship and systematic repression. The Guatemalan military, trained and equipped by the United States, carried out a genocide against the indigenous Maya population — with 93% of human rights violations attributed to state forces — making this conflict one of the clearest examples of U.S. imperialism directly enabling genocide in defense of corporate interests and landed oligarchy.',
    outcome = 'Peace accords were signed in 1996 after 36 years of conflict. The UN Commission for Historical Clarification documented over 200,000 killed or disappeared, with 83% of victims being indigenous Maya, and concluded that the state had committed acts of genocide. Despite the peace accords, structural inequality and impunity for perpetrators largely persist.'
WHERE name = 'Guatemalan Civil War';

-- Guatemalan Genocide
UPDATE conflicts
SET casualties_low = 140000,
    casualties_high = 200000,
    progressive_analysis = 'The Guatemalan genocide targeted indigenous Maya communities through a scorched-earth campaign directed by U.S.-trained military officers, with 93% of documented atrocities committed by state forces. The genocide was the culmination of a counter-revolutionary strategy that treated indigenous communities as inherent threats to the oligarchic order, representing a convergence of racial and class oppression in service of maintaining an extractive economic system rooted in colonial land dispossession.',
    outcome = 'In 2013, former dictator Rios Montt was convicted of genocide, the first time a former head of state was found guilty of genocide by a court in their own country, though the conviction was later overturned on procedural grounds. The genocide killed an estimated 200,000 people and destroyed over 400 indigenous villages.'
WHERE name = 'Guatemalan genocide'
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- COLOMBIAN ARMED CONFLICT (1964-present)
-- Total deaths: ~220,000-450,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 220000,
    casualties_high = 450000,
    progressive_analysis = 'The Colombian armed conflict is one of the longest-running class wars in the Western hemisphere, rooted in extreme land inequality and oligarchic control over state institutions, in which peasant guerrilla movements arose in response to state violence against agrarian reform movements. U.S. intervention through Plan Colombia militarized the conflict under the guise of the "war on drugs" while paramilitary forces allied with the military and landed elites carried out the majority of civilian massacres, displacing millions of peasants from their land to benefit agribusiness and mining interests.',
    outcome = 'A historic peace accord was signed with FARC in 2016, but implementation has been incomplete. Colombia''s Truth Commission documented over 450,000 conflict-related deaths between 1985-2018, with paramilitaries responsible for 45% of civilian killings. Over 9 million people have been registered as victims of the conflict.'
WHERE name IN ('Colombian conflict', 'Colombian Conflict', 'Colombian armed conflict', 'Colombian civil war')
   OR name ILIKE 'Colombian conflict%';

-- -----------------------------------------------------------------------------
-- SRI LANKAN CIVIL WAR (1983-2009)
-- Total deaths: ~80,000-100,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 80000,
    casualties_high = 100000,
    progressive_analysis = 'The Sri Lankan Civil War had its roots in the systematic discrimination against the Tamil minority by the Sinhalese-dominated state, a legacy of British colonial divide-and-rule policies that were perpetuated by postcolonial elites. While the LTTE pursued national self-determination through armed struggle, the Sri Lankan military''s final offensive in 2009 involved massive civilian casualties, potential war crimes including the deliberate shelling of hospitals and no-fire zones, with the international community largely silent due to the conflict''s framing as a "war on terror."',
    outcome = 'The Sri Lankan military achieved a decisive military victory in May 2009, defeating the LTTE after a brutal final offensive that killed tens of thousands of civilians trapped in the conflict zone. Accountability for war crimes remains largely unaddressed, and the underlying Tamil grievances about political marginalization persist.'
WHERE name IN ('Sri Lankan civil war');

-- -----------------------------------------------------------------------------
-- CHECHEN WARS (1994-2009)
-- First Chechen War: ~50,000-80,000
-- Second Chechen War: ~25,000-200,000
-- Combined: ~80,000-300,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 50000,
    casualties_high = 80000,
    progressive_analysis = 'The First Chechen War exposed the brutality of Russian post-Soviet imperialism as Moscow attempted to crush Chechen self-determination through indiscriminate bombardment that leveled Grozny and killed tens of thousands of civilians. The war was driven by Russian elite interests in maintaining control over Caucasus oil pipeline routes and preventing the precedent of secession, with the Chechen civilian population — including ethnic Russians living in Grozny — paying the heaviest price for Moscow''s imperial ambitions.',
    outcome = 'Russia suffered a humiliating military defeat, withdrawing in 1996 after failing to suppress the Chechen resistance. The Khasavyurt Accord effectively granted Chechnya de facto independence, though the devastation of Grozny and tens of thousands of civilian deaths made it a pyrrhic outcome for all sides.'
WHERE name = 'First Chechen War';

UPDATE conflicts
SET casualties_low = 25000,
    casualties_high = 200000,
    progressive_analysis = 'The Second Chechen War was launched by Vladimir Putin to consolidate power through nationalist militarism, using apartment bombings of dubious provenance as pretext for a devastating campaign that reduced Grozny to rubble and established a reign of terror through forced disappearances, torture, and extrajudicial killings. The conflict served as the template for Putin''s authoritarian consolidation, with the Chechen people subjected to collective punishment while the West largely acquiesced due to the "war on terror" framing, and the resulting Kadyrov regime became a vehicle for brutal repression under Russian patronage.',
    outcome = 'Russia established control through the installation of the Kadyrov regime, which rules through fear and repression while maintaining nominal Chechen autonomy. Tens of thousands of civilians were killed, Grozny was destroyed and rebuilt as a showcase for Kadyrov''s authoritarian rule, and Chechen fighters were later deployed in Russia''s invasion of Ukraine.'
WHERE name = 'Second Chechen War';

-- -----------------------------------------------------------------------------
-- BOSNIAN WAR (1992-1995)
-- Total deaths: ~97,000-105,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 97000,
    casualties_high = 105000,
    progressive_analysis = 'The Bosnian War demonstrated how nationalist elites can manipulate ethnic identity to destroy multi-ethnic working-class solidarity, as the breakup of socialist Yugoslavia was exploited by ethno-nationalist demagogues who used genocide and ethnic cleansing to carve out ethnically pure territories from what had been a functioning multi-ethnic society. Western powers bore responsibility through their arms embargo that disproportionately affected the Bosnian government while Serbian forces — armed by the Yugoslav army — carried out the Srebrenica genocide, and the belated NATO intervention served more to establish Western military credibility than to protect civilian lives.',
    outcome = 'The Dayton Agreement of 1995 ended the war but institutionalized ethnic division through a dysfunctional political system that entrenched nationalist parties in power. The Srebrenica genocide of 8,000 Bosnian Muslims became the worst mass atrocity in Europe since World War II, and the international community''s failure to prevent it remains a defining moral failure.'
WHERE name IN ('Bosnian War', 'Bosnian Genocide');

-- -----------------------------------------------------------------------------
-- KOSOVO WAR (1998-1999)
-- Total deaths: ~10,000-14,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 10000,
    casualties_high = 14000,
    progressive_analysis = 'The Kosovo War was shaped by the same ethno-nationalist dynamics that destroyed Yugoslavia, with Serbian state violence against the Albanian majority providing the justification for NATO''s first offensive military operation — an intervention that bypassed the UN Security Council and established the precedent for "humanitarian" wars that would later be invoked to justify the destruction of Libya and other sovereign states. While Serbian atrocities against Kosovar Albanians were real and horrific, NATO''s bombing campaign also killed civilians and destroyed civilian infrastructure, and the subsequent occupation served Western strategic interests in the Balkans.',
    outcome = 'NATO''s 78-day bombing campaign forced Serbian withdrawal from Kosovo, which declared independence in 2008. The war killed approximately 13,000 people and displaced over a million, and Kosovo''s independence remains contested internationally, with the territory hosting a major U.S. military base.'
WHERE name IN ('Kosovo War');

-- -----------------------------------------------------------------------------
-- SINO-VIETNAMESE WAR (1979)
-- Total deaths: ~30,000-75,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 30000,
    casualties_high = 75000,
    progressive_analysis = 'The Sino-Vietnamese War shattered the myth of socialist internationalist solidarity, as China launched a punitive invasion against a fellow socialist state in retaliation for Vietnam''s overthrow of the Chinese-backed Khmer Rouge genocide in Cambodia. The war reflected the triumph of great-power nationalism over revolutionary internationalism within the communist movement, with China aligning with U.S. imperialism against the Vietnamese revolution that had inspired anti-colonial movements worldwide, demonstrating how state interests can corrupt even ostensibly revolutionary governments.',
    outcome = 'China withdrew after a month of heavy fighting, with both sides claiming victory. The brief but bloody war killed tens of thousands on both sides and led to a decade of border tensions, while fundamentally reshaping Cold War alignments as China''s rapprochement with the United States deepened.'
WHERE name = 'Sino-Vietnamese War';

-- -----------------------------------------------------------------------------
-- FALKLANDS WAR (1982)
-- Total deaths: ~900-907
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 900,
    casualties_high = 910,
    progressive_analysis = 'The Falklands War was a conflict between two declining powers — the Argentine military junta seeking to distract from domestic economic crisis and political repression through nationalist adventurism, and Thatcher''s Britain seeking to revive imperial prestige and bolster a deeply unpopular government through war. Working-class conscripts on both sides paid the price for elite political calculations, with the war saving Thatcher''s government and enabling her assault on the British working class through deindustrialization and union-busting, while Argentina''s defeat hastened the junta''s collapse.',
    outcome = 'Britain recaptured the Falkland Islands after a 74-day war that killed 649 Argentine and 255 British military personnel. The war revived Thatcher''s political fortunes and contributed to the fall of Argentina''s military dictatorship, leading to democratic transition.'
WHERE name = 'Falklands War';

-- Also update Battle of the Falkland Islands if it exists as a separate entry
UPDATE conflicts
SET casualties_low = 900,
    casualties_high = 910,
    progressive_analysis = 'The Falklands conflict demonstrated how imperial nostalgia and nationalist militarism serve ruling-class interests, with both the Argentine junta and Thatcher government exploiting working-class patriotism to distract from domestic economic crises and class conflict.',
    outcome = 'British military victory restored UK sovereignty over the islands, saved the Thatcher government, and hastened the fall of the Argentine military junta.'
WHERE name = 'Battle of the Falkland Islands'
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- LEBANESE CIVIL WAR (1975-1990)
-- Total deaths: ~120,000-200,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 120000,
    casualties_high = 200000,
    progressive_analysis = 'The Lebanese Civil War was rooted in the contradictions of a sectarian political system designed by French colonialism to divide and rule, where a confessional power-sharing arrangement preserved Maronite Christian elite privilege while marginalizing the Muslim majority and the growing Palestinian refugee population. The war became a proxy battlefield for Israeli, Syrian, and broader Cold War interests, with each external power backing different factions to advance their strategic goals while Lebanese civilians of all sects suffered devastating violence, from the Sabra and Shatila massacre perpetrated by Israeli-allied militias to Syrian military occupation.',
    outcome = 'The Taif Agreement of 1989 ended the war by modestly redistributing political power among sectarian groups while Syrian forces maintained effective control over Lebanon. An estimated 150,000 were killed, 17,000 disappeared, and nearly a million fled the country, while the underlying sectarian political system was preserved rather than reformed.'
WHERE name = 'Lebanese Civil War';

-- -----------------------------------------------------------------------------
-- LIBYAN CIVIL WAR (2011+)
-- Total deaths: ~15,000-50,000 (2011 war); ongoing instability
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 15000,
    casualties_high = 50000,
    progressive_analysis = 'The Libyan Civil War and NATO intervention of 2011 exemplified the weaponization of "humanitarian intervention" as a tool of imperial regime change, as Western powers exploited a genuine uprising to destroy the Libyan state through massive aerial bombardment, transforming Africa''s most prosperous nation into a failed state with open slave markets. The destruction of Libya served Western interests by eliminating Gaddafi''s Pan-African economic initiatives, securing access to oil resources, and removing a leader who challenged Western financial hegemony by proposing a gold-backed African currency.',
    outcome = 'NATO''s intervention led to Gaddafi''s overthrow and extrajudicial killing in October 2011, but the resulting power vacuum plunged Libya into ongoing civil war between rival governments and militias. The country became a center of weapons proliferation, human trafficking, and migrant abuse, destabilizing the entire Sahel region.'
WHERE name IN ('Libyan Civil War', 'Civil War in Libya', '2011 military intervention in Libya');

-- -----------------------------------------------------------------------------
-- AFGHAN CIVIL WAR (post-Soviet, 1989-2001)
-- Total deaths: ~400,000-2,000,000 (wide range, includes famine)
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 400000,
    casualties_high = 2000000,
    progressive_analysis = 'The post-Soviet Afghan Civil War was the direct consequence of the U.S. policy of arming mujahideen fundamentalists to fight the Soviet Union, as the CIA''s proxies — having defeated the communist government — turned on each other in a devastating multi-sided civil war that destroyed Kabul and paved the way for Taliban rule. The war demonstrated the catastrophic long-term consequences of imperial proxy warfare, as the U.S. abandoned Afghanistan after achieving its Cold War objective, leaving the Afghan people to suffer the consequences of weapons and extremist ideologies that had been deliberately cultivated.',
    outcome = 'The Taliban captured Kabul in 1996 and imposed a repressive theocratic regime, reversing gains in women''s rights and education. The civil war killed hundreds of thousands and created millions of refugees, leaving Afghanistan as one of the poorest and most devastated countries in the world.'
WHERE name IN ('Afghan Civil War', 'Afghan Civil War (1989-2001)', 'Afghan Conflict');

-- War in Afghanistan (2001-2021)
UPDATE conflicts
SET casualties_low = 176000,
    casualties_high = 212000,
    progressive_analysis = 'The U.S. war in Afghanistan, launched in response to 9/11 with the stated goal of defeating al-Qaeda and the Taliban, became the longest war in American history — a two-decade occupation that killed over 170,000 people while enriching military contractors and achieving none of its stated objectives. The war was sustained by a military-industrial complex that profited from perpetual conflict, while Afghan civilians bore the brunt of drone strikes, night raids, and aerial bombardment, and the U.S.-backed government was hollowed out by corruption enabled by the flood of Western military spending.',
    outcome = 'The U.S. withdrew in August 2021 in a chaotic evacuation as the Taliban rapidly retook the country, rendering two decades of war and over $2 trillion in spending effectively pointless. The war killed over 170,000 people including 47,000 Afghan civilians and left Afghanistan impoverished and devastated.'
WHERE name IN ('War in Afghanistan', 'War in Afghanistan (2001–2021)', 'War in Afghanistan (2015–2021)', 'United States invasion of Afghanistan');

-- -----------------------------------------------------------------------------
-- SOMALI CIVIL WAR (1991-present)
-- Total deaths: ~300,000-1,000,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 300000,
    casualties_high = 1000000,
    progressive_analysis = 'The Somali Civil War and state collapse were the culmination of Cold War proxy politics in which both the U.S. and Soviet Union armed the Siad Barre dictatorship, followed by the devastating 1993 U.S. intervention that killed thousands of Somali civilians while being remembered in the West primarily through the lens of American casualties in "Black Hawk Down." The subsequent decades of statelessness, foreign military interventions, and drone warfare have perpetuated a cycle of violence that serves the interests of regional powers, arms dealers, and the U.S. counter-terrorism apparatus while Somali civilians endure perpetual displacement and famine.',
    outcome = 'Somalia has experienced over three decades of conflict, state collapse, famine, and foreign intervention. While a federal government was established in 2012, large portions of the country remain outside central control, al-Shabaab continues its insurgency, and millions of Somalis remain displaced.'
WHERE name IN ('Somali Civil War', 'War in Somalia', 'American military intervention in Somalia');

-- -----------------------------------------------------------------------------
-- SUDANESE CIVIL WAR(S)
-- Second Sudanese Civil War (1983-2005): ~1,500,000-2,000,000
-- Current conflict (2023-present): ~50,000-150,000+
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 1500000,
    casualties_high = 2000000,
    progressive_analysis = 'The Second Sudanese Civil War was fundamentally a conflict over resource distribution and political marginalization, in which the Arab-dominated Khartoum government waged a war of deliberate starvation, forced displacement, and ethnic violence against the predominantly Black African populations of southern Sudan. Oil wealth discovery in the south intensified the conflict as both the Sudanese government and Western oil corporations pursued extraction at the expense of southern Sudanese communities, while the international community''s response was shaped more by geopolitical calculations than humanitarian concern.',
    outcome = 'The Comprehensive Peace Agreement of 2005 ended the war and led to South Sudan''s independence in 2011. An estimated two million people died from violence, famine, and disease over the 22-year conflict, making it one of the deadliest wars since World War II, with four million displaced.'
WHERE name IN ('Second Sudanese Civil War', 'First Sudanese Civil War');

-- Update specifically for Second Sudanese Civil War
UPDATE conflicts
SET casualties_low = 1500000,
    casualties_high = 2000000
WHERE name = 'Second Sudanese Civil War'
  AND casualties_low IS NULL;

-- Current Sudanese Civil War (2023-present)
UPDATE conflicts
SET casualties_low = 50000,
    casualties_high = 150000,
    progressive_analysis = 'The 2023 Sudanese civil war erupted from a power struggle between rival military factions — the SAF and RSF — both of which had enriched themselves through decades of war profiteering, resource extraction, and suppression of the 2019 pro-democracy revolution. The conflict has produced horrific ethnic violence particularly in Darfur, with the RSF carrying out massacres reminiscent of the 2003 genocide, while the international community has largely ignored the crisis — a pattern of neglect toward African conflicts that reflects the racist hierarchies of global humanitarian concern.',
    outcome = 'As of early 2026, the war has killed tens of thousands and displaced over 10 million people, creating one of the world''s largest humanitarian crises. Both sides have been accused of systematic atrocities against civilians, and there is no clear path to resolution.'
WHERE name IN ('Sudanese civil war')
  AND (progressive_analysis IS NULL OR casualties_low IS NULL);

-- -----------------------------------------------------------------------------
-- SOUTH SUDANESE CIVIL WAR (2013-2020)
-- Total deaths: ~380,000-400,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 380000,
    casualties_high = 400000,
    progressive_analysis = 'The South Sudanese Civil War erupted barely two years after independence, as the SPLM leadership that had fought for liberation fractured along ethnic lines in a power struggle between President Kiir and Vice President Machar, both of whom mobilized ethnic militias that carried out horrific atrocities against civilians. The conflict exposed how national liberation movements can reproduce the same patterns of elite exploitation and ethnic manipulation they originally fought against, while the international community''s investment in South Sudan''s independence gave way to indifference as the country descended into one of the world''s worst humanitarian crises.',
    outcome = 'A power-sharing agreement was reached in 2018, with a unity government formed in 2020, but implementation has been incomplete and the country remains deeply fragile. An estimated 400,000 people died and over 4 million were displaced in a conflict that turned the world''s newest nation into one of its most troubled.'
WHERE name IN ('South Sudanese Civil War', 'War of Secession in South Sudan');

-- -----------------------------------------------------------------------------
-- MEXICAN DRUG WAR (2006-present)
-- Total deaths: ~150,000-460,000+ (homicides since 2006, not all directly linked)
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 150000,
    casualties_high = 400000,
    progressive_analysis = 'The Mexican Drug War is a direct consequence of U.S. prohibition policies and insatiable consumer demand for narcotics, combined with neoliberal economic policies (NAFTA) that devastated Mexican rural communities and drove desperate workers into the cartel economy. The militarized "war on drugs" approach, promoted and funded by the United States, has produced mass violence and state-cartel collusion while failing to reduce drug trafficking, because the fundamental drivers — U.S. demand, economic inequality, and the profitability of prohibition — remain unaddressed, and the resulting violence overwhelmingly affects working-class and indigenous communities.',
    outcome = 'Over 460,000 homicides have been recorded in Mexico since 2006, with an additional 100,000+ disappeared. The violence has not meaningfully reduced drug trafficking, and the conflict has produced a humanitarian crisis of enforced disappearances, mass graves, and displacement while enriching both cartels and the security industry.'
WHERE name IN ('Mexican drug war', 'Mexican Drug War');

-- -----------------------------------------------------------------------------
-- BOKO HARAM INSURGENCY (2009-present)
-- Total deaths: ~35,000-350,000 (direct + indirect)
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 35000,
    casualties_high = 350000,
    progressive_analysis = 'The Boko Haram insurgency emerged from the intersection of extreme poverty, state neglect, and corruption in northeastern Nigeria, where decades of neoliberal policies and elite extraction of oil wealth left the Muslim-majority north in desperate underdevelopment while the south developed through oil revenues. The Nigerian military''s brutal counterinsurgency — including extrajudicial killings, mass detention, and displacement of civilian populations — has often been as devastating to communities as Boko Haram itself, while Western "counterterrorism" assistance has strengthened an abusive security apparatus rather than addressing the underlying economic marginalization that fuels recruitment.',
    outcome = 'The insurgency has killed an estimated 350,000 people through direct and indirect causes, displaced over 3 million, and devastated the Lake Chad region. While Boko Haram has been weakened militarily and factionally split, the underlying conditions of poverty and marginalization that fueled the insurgency remain unaddressed.'
WHERE name IN ('Boko Haram insurgency', '2009 Boko Haram uprising');

-- -----------------------------------------------------------------------------
-- RUSSO-UKRAINIAN WAR (2014/2022-present)
-- Total deaths: ~150,000-500,000+ (full-scale invasion from 2022)
-- -----------------------------------------------------------------------------

-- The overarching Russo-Ukrainian War entry
UPDATE conflicts
SET casualties_low = 150000,
    casualties_high = 500000,
    progressive_analysis = 'The Russo-Ukrainian War represents a catastrophic inter-imperialist conflict in which Russian expansionism and NATO''s eastward encroachment have converged to devastate Ukraine, with Ukrainian and Russian working-class conscripts dying in industrial-scale trench warfare while arms manufacturers reap enormous profits. The war has exposed the bankruptcy of both Russian nationalist imperialism and Western liberal interventionism — Russia''s brutal invasion violates the principle of self-determination while NATO''s proxy war strategy aims to "weaken Russia" at the cost of Ukrainian lives, and the resulting conflict has accelerated global militarization and undermined prospects for international cooperation on existential threats like climate change.',
    outcome = 'As of early 2026, the war has killed hundreds of thousands on both sides, displaced millions of Ukrainians, and caused massive destruction to Ukrainian infrastructure. Combined Russian and Ukrainian casualties may approach 2 million (killed and wounded), making it the deadliest European conflict since World War II.'
WHERE name IN ('Russo-Ukrainian War', 'full-scale Russo-Ukrainian war');

-- 2022 Russian invasion
UPDATE conflicts
SET casualties_low = 150000,
    casualties_high = 500000,
    progressive_analysis = 'The 2022 Russian invasion represents a war of imperial aggression that has devastated Ukraine while enriching the global arms industry. Russian working-class conscripts and Ukrainian citizens are paying the price for a conflict driven by Russian nationalist expansionism and the geopolitical competition between NATO and Russia over spheres of influence in Eastern Europe.',
    outcome = 'The invasion has evolved into a grinding war of attrition with massive casualties on both sides, widespread destruction of Ukrainian infrastructure, and millions displaced. No resolution appears imminent as of early 2026.'
WHERE name = '2022 Russian invasion of Ukraine';

-- 2014 Russian invasion
UPDATE conflicts
SET casualties_low = 14000,
    casualties_high = 14500,
    progressive_analysis = 'Russia''s 2014 annexation of Crimea and support for separatist forces in eastern Ukraine represented a reassertion of Russian imperial ambitions in the post-Soviet space, while the West''s response was shaped more by geopolitical competition than genuine concern for Ukrainian sovereignty. The conflict''s roots in both Russian expansionism and the EU/NATO''s aggressive courting of Ukraine placed Ukrainian civilians in the crossfire of great-power competition.',
    outcome = 'Russia annexed Crimea and established separatist enclaves in Donetsk and Luhansk, killing approximately 14,000 people between 2014 and 2022 and displacing over 1.5 million. The conflict set the stage for the full-scale Russian invasion in February 2022.'
WHERE name = '2014 Russian invasion of Ukraine';

-- -----------------------------------------------------------------------------
-- ISRAELI-PALESTINIAN CONFLICT / GAZA
-- Overall conflict: difficult to estimate total across all phases
-- 2023-present Gaza war: ~50,000-100,000+
-- -----------------------------------------------------------------------------

-- The Gaza War (2023-present)
UPDATE conflicts
SET casualties_low = 50000,
    casualties_high = 100000,
    progressive_analysis = 'The 2023-present Gaza war represents the most devastating phase of a decades-long colonial project in which Israel — backed unconditionally by the United States — has imposed an apartheid system of control over the Palestinian people, culminating in what the International Court of Justice has found to be a plausible genocide. The massive scale of civilian killing, destruction of hospitals, schools, and residential areas, deliberate obstruction of humanitarian aid, and forced displacement of virtually the entire population of Gaza reflects the logic of settler-colonial elimination, enabled by Western governments that have provided the weapons, diplomatic cover, and ideological justification for the systematic destruction of Palestinian society.',
    outcome = 'As of early 2026, the war has killed over 70,000 Palestinians according to official figures, with independent estimates suggesting the true toll exceeds 100,000 when accounting for those buried under rubble. The vast majority of Gaza''s infrastructure has been destroyed, virtually the entire population has been displaced, and the ICJ has ordered provisional measures against Israel for plausible genocide.'
WHERE name IN ('Gaza war', 'Gaza War (2008–2009)');

-- Update the 2008-2009 Gaza War separately with its own figures
UPDATE conflicts
SET casualties_low = 1400,
    casualties_high = 1450,
    progressive_analysis = 'Operation Cast Lead was a massively disproportionate Israeli military assault on the besieged Gaza Strip that killed over 1,400 Palestinians, the vast majority civilians, in response to rocket fire that had killed a handful of Israelis. The Goldstone Report documented evidence of war crimes and possible crimes against humanity by both sides, though Israel''s actions were characterized by the deliberate targeting of civilian infrastructure and the use of white phosphorus in densely populated areas.',
    outcome = 'The 22-day operation killed approximately 1,400 Palestinians including over 300 children, while 13 Israelis died. Despite international condemnation and the Goldstone Report, no accountability measures were implemented, establishing a pattern of impunity for Israeli military operations in Gaza.'
WHERE name = 'Gaza War (2008–2009)';

-- Israeli-Palestinian conflict general entries
UPDATE conflicts
SET progressive_analysis = 'The Israeli-Palestinian conflict is fundamentally a settler-colonial project in which European Zionist settlers, with the backing of British imperialism and later U.S. hegemony, dispossessed the indigenous Palestinian population through ethnic cleansing, military occupation, and an apartheid system of control. The conflict cannot be understood outside the framework of colonialism and imperialism, as Israel serves as a strategic Western outpost in the resource-rich Middle East while the Palestinian people''s right to self-determination is systematically denied.'
WHERE name IN ('1947–1948 Civil War in Mandatory Palestine', '1948 Palestine war', '1948 Arab–Israeli War', 'Arab–Israeli Wars', 'Contemporary Palestinian Revolution')
  AND progressive_analysis IS NULL;

-- Broader Israeli-Palestinian entries
UPDATE conflicts
SET casualties_low = 50000,
    casualties_high = 100000,
    progressive_analysis = 'Israel''s military operations in Gaza represent the concentrated violence of a settler-colonial system that maintains an open-air prison for over two million Palestinians through a comprehensive blockade, periodic military assaults characterized by massive civilian casualties, and the systematic destruction of civilian infrastructure — all enabled by unconditional U.S. military and diplomatic support.',
    outcome = 'The ongoing assault on Gaza has killed tens of thousands of Palestinians, destroyed most of Gaza''s infrastructure, and displaced virtually the entire population, constituting what multiple international legal bodies and human rights organizations have characterized as genocide.'
WHERE name IN ('Israeli invasion of the Gaza Strip', 'bombing of the Gaza Strip', 'siege of North Gaza', 'Siege of Northern Gaza', 'Siege of Gaza City', '2025 Gaza City offensive')
  AND progressive_analysis IS NULL;

-- 2024 Israel-Hezbollah War
UPDATE conflicts
SET casualties_low = 4000,
    casualties_high = 5000,
    progressive_analysis = 'The 2024 Israel-Hezbollah War, triggered by Israel''s devastating electronic device attacks and escalation of cross-border hostilities during the Gaza war, demonstrated how Israel''s wars of aggression destabilize the entire region. The conflict devastated southern Lebanon and Beirut''s southern suburbs, killing thousands of Lebanese civilians while Western media largely framed the destruction as a justified response to Hezbollah rather than acknowledging the pattern of Israeli military aggression against its neighbors.',
    outcome = 'A ceasefire was reached in November 2024 after Israel''s ground invasion and massive aerial bombardment of Lebanon killed thousands and displaced over a million people, with significant destruction of Lebanese civilian infrastructure.'
WHERE name = '2024 Israel–Hezbollah War'
  AND progressive_analysis IS NULL;

-- Israeli invasion of Lebanon 2024
UPDATE conflicts
SET casualties_low = 4000,
    casualties_high = 5000,
    progressive_analysis = 'Israel''s 2024 invasion of Lebanon continued a long pattern of Israeli military aggression against its northern neighbor, destroying civilian infrastructure and displacing over a million people while the U.S. provided diplomatic cover and military support for the operation.',
    outcome = 'The invasion caused massive destruction in southern Lebanon and resulted in thousands of casualties before a ceasefire was reached.'
WHERE name = '2024 Israeli invasion of Lebanon'
  AND progressive_analysis IS NULL;

-- -----------------------------------------------------------------------------
-- FIRST SUDANESE CIVIL WAR (1955-1972)
-- Total deaths: ~500,000
-- -----------------------------------------------------------------------------
UPDATE conflicts
SET casualties_low = 500000,
    casualties_high = 500000,
    progressive_analysis = 'The First Sudanese Civil War was rooted in the colonial legacy of British divide-and-rule governance that developed the Arab north while neglecting the African south, creating structural inequalities that erupted into armed conflict when the south was denied promised autonomy at independence. The war established the pattern of northern Arab-dominated governments waging war against southern African populations that would define Sudanese politics for decades.',
    outcome = 'The Addis Ababa Agreement of 1972 granted southern Sudan regional autonomy, temporarily ending the 17-year conflict. An estimated 500,000 people died, but the underlying north-south tensions remained unresolved and would erupt again in the Second Civil War in 1983.'
WHERE name = 'First Sudanese Civil War'
  AND progressive_analysis IS NULL;

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- Run these after the UPDATE to check results
-- =============================================================================
-- SELECT name, casualties_low, casualties_high,
--        LEFT(progressive_analysis, 80) as analysis_preview,
--        LEFT(outcome, 80) as outcome_preview
-- FROM conflicts
-- WHERE casualties_low IS NOT NULL
--   AND progressive_analysis IS NOT NULL
-- ORDER BY casualties_high DESC NULLS LAST
-- LIMIT 50;
