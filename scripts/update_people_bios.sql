-- ============================================================================
-- UPDATE bio_short and progressive_analysis for major leftist/socialist figures
-- Only updates records WHERE bio_short IS NULL
-- Generated: 2026-02-12
-- ============================================================================

BEGIN;

-- ============================================================================
-- REVOLUTIONARY LEADERS
-- ============================================================================

-- Karl Marx
UPDATE people SET
    bio_short = 'German philosopher, economist, and revolutionary socialist (1818-1883). Author of Das Kapital and The Communist Manifesto (with Engels). Developed historical materialism, the theory of surplus value, and class struggle as the engine of history. His work laid the intellectual foundation for modern communism and socialism.',
    progressive_analysis = 'Marx''s analysis of capitalism''s internal contradictions, commodity fetishism, and the exploitation inherent in wage labor remains the foundational framework for virtually all subsequent leftist thought. His insistence that the emancipation of the working class must be the act of the working class itself established the principle of proletarian self-organization. His legacy is the indispensable starting point for any serious anti-capitalist critique.'
WHERE name LIKE '%Karl Marx%' AND bio_short IS NULL;

-- Friedrich Engels
UPDATE people SET
    bio_short = 'German philosopher, industrialist, and revolutionary socialist (1820-1895). Co-author of The Communist Manifesto with Marx and author of The Condition of the Working Class in England. Financially supported Marx''s work and edited volumes 2 and 3 of Das Kapital after Marx''s death. Key architect of Marxist theory.',
    progressive_analysis = 'Engels''s firsthand observations of industrial Manchester produced one of the earliest systematic studies of working-class immiseration under capitalism. His theoretical contributions on the state, the family, and dialectics of nature expanded Marxism into a comprehensive worldview. As both theorist and organizer, he modeled the unity of intellectual work and revolutionary practice that remains central to leftist movements.'
WHERE name LIKE '%Friedrich Engels%' AND bio_short IS NULL;

-- Vladimir Lenin
UPDATE people SET
    bio_short = 'Russian revolutionary and political theorist (1870-1924). Leader of the Bolshevik Revolution of 1917 and first head of the Soviet state. Author of Imperialism, the Highest Stage of Capitalism and What Is to Be Done? Developed the theory of the vanguard party and anti-imperialist analysis of global capitalism.',
    progressive_analysis = 'Lenin''s theory of imperialism connected the exploitation of colonized peoples to the dynamics of monopoly capitalism, providing a framework that remains essential to anti-colonial and anti-imperialist movements worldwide. His organizational theory of the vanguard party transformed socialism from a theoretical critique into a practical revolutionary force. His leadership of the first successful socialist revolution fundamentally altered the trajectory of 20th-century history.'
WHERE name LIKE '%Vladimir Lenin%' AND bio_short IS NULL;

-- Leon Trotsky
UPDATE people SET
    bio_short = 'Russian revolutionary, Marxist theorist, and Soviet politician (1879-1940). Led the Red Army during the Russian Civil War and developed the theory of permanent revolution. Exiled by Stalin, he founded the Fourth International. Assassinated in Mexico City by a Soviet agent. Author of The Revolution Betrayed.',
    progressive_analysis = 'Trotsky''s theory of permanent revolution argued that socialist transformation in underdeveloped countries need not wait for bourgeois-democratic stages, profoundly influencing Third World liberation movements. His critique of Stalinist bureaucratic degeneration in The Revolution Betrayed provided an early leftist framework for understanding how workers'' states can be captured by privileged elites. His insistence on internationalism and workers'' democracy remains a vital current within the socialist tradition.'
WHERE name LIKE '%Leon Trotsky%' AND bio_short IS NULL;

-- Rosa Luxemburg
UPDATE people SET
    bio_short = 'Polish-German Marxist revolutionary, theorist, and anti-war activist (1871-1919). Co-founded the Spartacus League and the Communist Party of Germany. Author of The Accumulation of Capital and Reform or Revolution. Advocated for mass strikes and workers'' democracy. Murdered by Freikorps paramilitaries during the Spartacist uprising.',
    progressive_analysis = 'Luxemburg''s critique of reformism in Reform or Revolution established the case that capitalism cannot be gradually legislated away, a debate that remains central to leftist strategy. Her emphasis on spontaneous mass action and rank-and-file democracy challenged the top-down vanguardism of her era, prefiguring later council communist and autonomist traditions. Her martyrdom at the hands of reactionary forces made her an enduring symbol of revolutionary courage and the dangers faced by those who challenge capitalist power.'
WHERE name LIKE '%Rosa Luxemburg%' AND bio_short IS NULL;

-- Mao Zedong
UPDATE people SET
    bio_short = 'Chinese communist revolutionary and founding father of the People''s Republic of China (1893-1976). Led the Chinese Communist Party to victory in the Chinese Civil War in 1949. Developed Maoism, adapting Marxism-Leninism to agrarian conditions. Launched the Great Leap Forward and Cultural Revolution.',
    progressive_analysis = 'Mao''s adaptation of Marxism to the conditions of a peasant-majority society broke with orthodox Marxist assumptions about the urban proletariat as the sole revolutionary agent, opening new theoretical paths for anti-colonial movements across Asia, Africa, and Latin America. His theory of protracted people''s war became a blueprint for guerrilla liberation struggles worldwide. His legacy remains deeply contested on the left due to the catastrophic human costs of the Great Leap Forward and Cultural Revolution.'
WHERE name LIKE '%Mao Zedong%' AND bio_short IS NULL;

-- Ho Chi Minh
UPDATE people SET
    bio_short = 'Vietnamese communist revolutionary leader and statesman (1890-1969). Founded the Viet Minh independence movement and led Vietnam''s struggle against French colonialism and American intervention. First president of the Democratic Republic of Vietnam. Synthesized Marxism-Leninism with Vietnamese nationalism and anti-colonial resistance.',
    progressive_analysis = 'Ho Chi Minh''s leadership of the Vietnamese independence struggle demonstrated that colonized peoples could defeat major imperial powers through organized resistance rooted in popular support. His ability to fuse Marxist class analysis with national liberation created a model that inspired anti-colonial movements globally. The Vietnamese victory under his ideological guidance remains one of the most significant defeats of Western imperialism in the 20th century.'
WHERE name LIKE '%Ho Chi Minh%' AND bio_short IS NULL;

-- Fidel Castro
UPDATE people SET
    bio_short = 'Cuban revolutionary and statesman (1926-2016). Led the Cuban Revolution that overthrew the Batista dictatorship in 1959. Served as Prime Minister and later President of Cuba for nearly five decades. Built a socialist state 90 miles from the United States, achieving notable advances in healthcare and education despite the US embargo.',
    progressive_analysis = 'Castro''s revolution demonstrated that even in the immediate sphere of US hegemony, a small nation could chart an independent socialist path and survive decades of imperial hostility including invasion attempts and economic blockade. Cuba''s achievements in universal healthcare, literacy, and medical internationalism under his leadership became a powerful counter-narrative to capitalist development models. His defiance of US imperialism made him a symbol of Third World sovereignty and anti-imperialist resistance.'
WHERE name LIKE '%Fidel Castro%' AND bio_short IS NULL;

-- Che Guevara
UPDATE people SET
    bio_short = 'Argentine-born Marxist revolutionary, physician, and guerrilla leader (1928-1967). Key figure in the Cuban Revolution alongside Fidel Castro. Served in Cuba''s revolutionary government before departing to spread revolution in the Congo and Bolivia. Author of Guerrilla Warfare. Captured and executed by CIA-backed Bolivian forces.',
    progressive_analysis = 'Guevara''s concept of the revolutionary "new man" and his theory of the guerrilla foco attempted to resolve the tension between vanguardism and popular mobilization that has long divided the left. His willingness to sacrifice personal comfort and ultimately his life for international socialist revolution made him the preeminent symbol of revolutionary commitment and anti-imperialist solidarity. His image remains the most recognized icon of radical resistance worldwide.'
WHERE name LIKE '%Che Guevara%' AND bio_short IS NULL;

-- Thomas Sankara
UPDATE people SET
    bio_short = 'Burkinabe revolutionary and Pan-Africanist leader (1949-1987). President of Burkina Faso from 1983 until his assassination. Known as "Africa''s Che Guevara," he launched mass vaccination campaigns, literacy programs, and women''s rights initiatives. Renamed Upper Volta to Burkina Faso ("Land of Upright People"). Overthrown and killed in a coup led by Blaise Compaore.',
    progressive_analysis = 'Sankara''s brief presidency demonstrated that radical anti-imperialist governance could achieve transformative social gains even in one of the world''s poorest nations, with dramatic improvements in literacy, public health, and women''s participation. His outspoken rejection of foreign debt and neocolonial economic structures anticipated the critiques of structural adjustment that would define radical African politics for decades. His assassination and the reversal of his programs stand as a powerful indictment of how imperial interests eliminate leaders who challenge the global economic order.'
WHERE name LIKE '%Thomas Sankara%' AND bio_short IS NULL;

-- Salvador Allende
UPDATE people SET
    bio_short = 'Chilean physician, socialist politician, and president (1908-1973). First democratically elected Marxist head of state in Latin America, serving as President of Chile from 1970 until the US-backed military coup of September 11, 1973. Pursued nationalization of copper and banking, land reform, and social programs. Died during the coup that brought Pinochet to power.',
    progressive_analysis = 'Allende''s democratic road to socialism tested whether structural transformation could be achieved through existing electoral and constitutional frameworks, a question that remains central to leftist strategy. The CIA-backed coup that destroyed his government became the definitive case study of how imperial power and domestic capital will resort to violent overthrow when democratic processes produce anti-capitalist outcomes. His legacy is a reminder of both the promise and the vulnerability of the parliamentary path to socialism.'
WHERE name LIKE '%Salvador Allende%' AND bio_short IS NULL;

-- Daniel Ortega
UPDATE people SET
    bio_short = 'Nicaraguan revolutionary and politician (born 1945). Leader of the Sandinista National Liberation Front (FSLN) that overthrew the Somoza dictatorship in 1979. Served as President of Nicaragua from 1985-1990 during the Contra War, and again from 2007 to present. His later presidency has been marked by increasing authoritarianism and contested elections.',
    progressive_analysis = 'Ortega''s role in the Sandinista Revolution represented one of the last successful armed socialist revolutions of the Cold War era, and the Sandinista programs in literacy, land reform, and healthcare demonstrated the potential of revolutionary governance. However, his return to power and subsequent consolidation of authoritarian rule has deeply divided the international left, raising uncomfortable questions about revolutionary movements that abandon democratic principles. His trajectory illustrates the tension between anti-imperialism and internal democratic accountability.'
WHERE name LIKE '%Daniel Ortega%' AND bio_short IS NULL;

-- Hugo Chavez
UPDATE people SET
    bio_short = 'Venezuelan military officer, politician, and president (1954-2013). Led a failed coup attempt in 1992 before winning the presidency democratically in 1998. Founded the Bolivarian Revolution and the concept of "21st-century socialism." Used oil revenues to fund social programs (Misiones) reducing poverty and illiteracy. Prominent critic of US imperialism.',
    progressive_analysis = 'Chavez''s Bolivarian Revolution revived the prospect of socialist transformation in Latin America after the neoliberal consensus of the 1990s, using state control of oil revenues to fund massive social programs that demonstrably reduced poverty and inequality. His promotion of regional integration through ALBA and his vocal anti-imperialism challenged US hegemony in the Western Hemisphere. The sustainability of his model and the crisis that followed his death remain subjects of intense debate within the left about resource nationalism and institutional resilience.'
WHERE name LIKE '%Hugo Ch%vez%' AND bio_short IS NULL;

-- Evo Morales
UPDATE people SET
    bio_short = 'Bolivian politician, union leader, and activist (born 1959). First Indigenous president of Bolivia, serving from 2006 to 2019. Rose to prominence as leader of the cocalero (coca growers) movement. Nationalized natural gas, reduced poverty, and championed Indigenous rights. Resigned amid disputed 2019 elections and allegations of irregularities.',
    progressive_analysis = 'Morales''s presidency represented a historic rupture in Latin American politics: for the first time, an Indigenous leader governed a nation whose Indigenous majority had been systematically excluded from power since colonization. His nationalization of hydrocarbons and redistribution of wealth achieved significant reductions in poverty and inequality. His government''s empowerment of Indigenous political identity challenged the colonial legacies embedded in Latin American state structures and demonstrated the revolutionary potential of Indigenous-led movements.'
WHERE name LIKE '%Evo Morales%' AND bio_short IS NULL;

-- Kwame Nkrumah
UPDATE people SET
    bio_short = 'Ghanaian revolutionary, anti-colonial leader, and Pan-Africanist (1909-1972). Led the Gold Coast to independence as Ghana in 1957, becoming the first president of a sub-Saharan African nation to achieve independence from colonial rule. Advocated for a united continental African government. Author of Neo-Colonialism: The Last Stage of Imperialism. Overthrown by a CIA-backed coup in 1966.',
    progressive_analysis = 'Nkrumah''s concept of neo-colonialism identified how formal political independence without economic sovereignty left African nations trapped in structures of imperial exploitation, an analysis that remains devastatingly relevant today. His vision of Pan-African unity as the only viable path to genuine decolonization challenged the balkanization of Africa into weak, dependent states that served Western interests. His overthrow by a coup linked to Western intelligence agencies illustrated the very neo-colonial dynamics he had theorized.'
WHERE name LIKE '%Kwame Nkrumah%' AND bio_short IS NULL;

-- Julius Nyerere
UPDATE people SET
    bio_short = 'Tanzanian anti-colonial leader, statesman, and political philosopher (1922-1999). First President of Tanzania, serving from 1964 to 1985. Developed the philosophy of Ujamaa (African socialism) emphasizing communal self-reliance and rural development. Led Tanzania''s intervention against Idi Amin''s Uganda. One of the few African leaders to voluntarily step down from power.',
    progressive_analysis = 'Nyerere''s Ujamaa philosophy represented a serious attempt to develop an authentically African socialism rooted in communal traditions rather than imported European models, challenging both colonial capitalism and orthodox Marxism-Leninism. His Arusha Declaration and emphasis on self-reliance offered an alternative development model for post-colonial nations seeking to avoid dependency on either Cold War bloc. Though the villagization program had mixed results, his moral authority and commitment to Pan-African solidarity made him one of the most respected leaders of the Global South.'
WHERE name LIKE '%Julius Nyerere%' AND bio_short IS NULL;

-- Patrice Lumumba
UPDATE people SET
    bio_short = 'Congolese independence leader and first democratically elected Prime Minister of the Republic of the Congo (1925-1961). Led the struggle for independence from Belgium. Sought to maintain national unity and economic sovereignty over Congo''s vast mineral wealth. Overthrown in a coup backed by Belgium and the CIA, then captured and executed. His assassination is one of the most consequential political murders of the 20th century.',
    progressive_analysis = 'Lumumba''s insistence on genuine economic sovereignty over Congo''s mineral wealth directly threatened Western corporate and geopolitical interests, making his elimination a priority for Belgian and American intelligence services. His murder, carried out with direct Western complicity, set the stage for decades of dictatorship under Mobutu and established a pattern of imperial intervention against African leaders who challenge resource extraction by foreign capital. Lumumba''s martyrdom remains a defining symbol of how the promise of African independence was betrayed by neo-colonial violence.'
WHERE name LIKE '%Patrice Lumumba%' AND bio_short IS NULL;

-- Amilcar Cabral
UPDATE people SET
    bio_short = 'Guinea-Bissauan and Cape Verdean revolutionary, agronomist, and political theorist (1924-1973). Founded the PAIGC and led the armed independence struggle against Portuguese colonialism. Developed influential theories on culture, class, and national liberation. Regarded as one of Africa''s foremost anti-colonial thinkers alongside Fanon. Assassinated in Conakry in 1973, months before Guinea-Bissau''s independence.',
    progressive_analysis = 'Cabral''s theoretical contributions on the role of culture in liberation struggle and his nuanced class analysis of colonial societies advanced anti-colonial thought beyond both orthodox Marxism and narrow nationalism. His concept of "return to the source" argued that cultural reclamation was essential to revolutionary consciousness, influencing liberation movements across Africa and the diaspora. His assassination by agents linked to Portuguese intelligence, like Lumumba''s before him, demonstrated the existential threat that revolutionary African intellectuals posed to colonial power.'
WHERE name LIKE '%lcar Cabral%' AND bio_short IS NULL;

-- Josip Broz Tito
UPDATE people SET
    bio_short = 'Yugoslav revolutionary, statesman, and President of Yugoslavia (1892-1980). Led the Yugoslav Partisans against Nazi occupation in World War II and established socialist Yugoslavia. Broke with Stalin in 1948 and developed an independent socialist model based on workers'' self-management. Co-founded the Non-Aligned Movement with Nehru and Nasser.',
    progressive_analysis = 'Tito''s break with Stalin in 1948 demonstrated that socialism need not be subordinate to Soviet hegemony, opening space for independent and heterodox socialist experiments worldwide. His system of workers'' self-management represented one of the most significant attempts to create democratic structures within a socialist economy, challenging both Western capitalism and Soviet-style central planning. The Non-Aligned Movement he co-founded gave Third World nations a framework for resisting both Cold War blocs, asserting sovereignty in a bipolar world.'
WHERE name LIKE '%Josip Broz Tito%' AND bio_short IS NULL;

-- Gamal Abdel Nasser
UPDATE people SET
    bio_short = 'Egyptian military officer, revolutionary, and president (1918-1970). Led the 1952 Free Officers Revolution that overthrew the monarchy. President of Egypt from 1954 to 1970. Nationalized the Suez Canal, implemented land reform, and championed Arab nationalism and Pan-Arabism. Co-founder of the Non-Aligned Movement. His pan-Arab socialist vision inspired movements across the Middle East and North Africa.',
    progressive_analysis = 'Nasser''s nationalization of the Suez Canal was a watershed moment in anti-imperialist struggle, demonstrating that Third World nations could reclaim sovereignty over strategic assets from colonial powers and survive the backlash. His Arab socialism combined state-led industrialization, land reform, and welfare provisions that materially improved the lives of Egypt''s poor, while his pan-Arab vision challenged the artificial borders imposed by European colonialism. His legacy within the left is complicated by authoritarian governance and the suppression of communists, but his anti-imperialist defiance reshaped the political landscape of the Middle East.'
WHERE name LIKE '%Gamal Abdel Nasser%' AND bio_short IS NULL;

-- ============================================================================
-- THEORISTS & INTELLECTUALS
-- ============================================================================

-- Antonio Gramsci
UPDATE people SET
    bio_short = 'Italian Marxist philosopher, politician, and cultural theorist (1891-1937). Co-founded the Communist Party of Italy. Imprisoned by Mussolini''s fascist regime from 1926 until shortly before his death. Wrote the Prison Notebooks while incarcerated, developing concepts of cultural hegemony, the organic intellectual, and the war of position that transformed Marxist political theory.',
    progressive_analysis = 'Gramsci''s theory of cultural hegemony explained how ruling classes maintain power not merely through coercion but through the manufacture of consent, providing the left with essential tools for understanding ideological domination in liberal democracies. His concepts of the organic intellectual and the war of position shifted Marxist strategy from a narrow focus on economic struggle toward the broader terrain of culture, education, and civil society. His work remains arguably the most influential body of Marxist theory produced in the 20th century for understanding how to build counter-hegemonic movements.'
WHERE name LIKE '%Antonio Gramsci%' AND bio_short IS NULL;

-- Georg Lukacs
UPDATE people SET
    bio_short = 'Hungarian Marxist philosopher, literary critic, and aesthetician (1885-1971). Served as Minister of Culture in the short-lived Hungarian Soviet Republic of 1919. Author of History and Class Consciousness (1923), which revitalized Marxist philosophy through the concept of reification. A founder of Western Marxism and a major influence on the Frankfurt School and critical theory.',
    progressive_analysis = 'Lukacs''s History and Class Consciousness rescued Marxism from the vulgar economic determinism of the Second International by foregrounding the dialectical relationship between consciousness and material conditions. His theory of reification showed how capitalist social relations transform all aspects of human life into commodified, thing-like objects, extending Marx''s analysis into the realm of everyday experience. His work established the theoretical foundation for Western Marxism and remains indispensable for understanding how capitalism colonizes consciousness itself.'
WHERE name LIKE '%Georg Luk%cs%' AND bio_short IS NULL;

-- Herbert Marcuse
UPDATE people SET
    bio_short = 'German-American philosopher and political theorist (1898-1979). Member of the Frankfurt School and leading figure of the New Left. Author of One-Dimensional Man, Eros and Civilization, and An Essay on Liberation. Analyzed how advanced industrial society creates false needs and absorbs opposition. Called "the father of the New Left" for his influence on 1960s radical movements.',
    progressive_analysis = 'Marcuse''s analysis of how consumer capitalism integrates and neutralizes opposition through the creation of false needs provided the theoretical framework for understanding why revolution had not occurred in advanced capitalist societies. His concept of "repressive tolerance" revealed how liberal democratic systems manage dissent by absorbing it into the existing order. His work bridging Marxism and psychoanalysis, particularly his argument that liberation must encompass the erotic and aesthetic dimensions of human existence, expanded the horizons of leftist thought beyond purely economic concerns.'
WHERE name LIKE '%Herbert Marcuse%' AND bio_short IS NULL;

-- Theodor Adorno
UPDATE people SET
    bio_short = 'German philosopher, sociologist, musicologist, and critical theorist (1903-1969). Leading member of the Frankfurt School. Co-authored Dialectic of Enlightenment with Max Horkheimer, analyzing how Enlightenment rationality produced new forms of domination. Author of Minima Moralia and Negative Dialectics. Developed critical theory''s analysis of the culture industry and authoritarian personality.',
    progressive_analysis = 'Adorno''s concept of the culture industry demonstrated how mass media and popular culture function as instruments of social control, manufacturing conformity and blocking critical consciousness. His Negative Dialectics insisted on the non-identity of concept and object, resisting all totalizing systems of thought including vulgar Marxism, and preserving the possibility of genuine critique. His work on the authoritarian personality provided lasting tools for understanding how fascism and reaction take root in the psychic structures produced by capitalist society.'
WHERE name LIKE '%Theodor Adorno%' AND bio_short IS NULL;

-- Frantz Fanon
UPDATE people SET
    bio_short = 'Martinican-Algerian psychiatrist, revolutionary, and political philosopher (1925-1961). Joined the Algerian National Liberation Front (FLN) during the Algerian War of Independence. Author of The Wretched of the Earth and Black Skin, White Masks. Analyzed the psychology of colonization, racial identity, and the role of violence in decolonization. Died of leukemia at age 36.',
    progressive_analysis = 'Fanon''s psychological analysis of colonialism revealed how imperial domination produces internalized inferiority among the colonized, making his work foundational for understanding the psychic dimensions of oppression alongside its material structures. His argument in The Wretched of the Earth that violence is not merely a tactical necessity but a psychologically liberating act for the colonized generated profound debate that continues to shape anti-colonial and anti-racist theory. His synthesis of Marxism, existentialism, and anti-colonial struggle created a theoretical framework that has influenced every subsequent generation of radical thinkers in the Global South.'
WHERE name LIKE '%Frantz Fanon%' AND bio_short IS NULL;

-- Edward Said
UPDATE people SET
    bio_short = 'Palestinian-American literary critic, public intellectual, and advocate for Palestinian rights (1935-2003). Professor at Columbia University for over four decades. Author of Orientalism (1978), which transformed the study of colonialism by analyzing how the West constructed the "Orient" as an object of knowledge and domination. Leading voice for Palestinian self-determination.',
    progressive_analysis = 'Said''s Orientalism demonstrated how Western academic knowledge production served as an instrument of imperial power, fundamentally reshaping how the left understands the relationship between culture, scholarship, and domination. His work established postcolonial studies as a field and provided intellectual tools for deconstructing the racist and imperialist assumptions embedded in Western institutions. His tireless advocacy for Palestinian rights, combining rigorous scholarship with public engagement, modeled the role of the committed intellectual speaking truth to power.'
WHERE name LIKE '%Edward Said%' AND bio_short IS NULL;

-- Noam Chomsky
UPDATE people SET
    bio_short = 'American linguist, philosopher, cognitive scientist, and political activist (born 1928). Institute Professor Emeritus at MIT. Revolutionized the field of linguistics with his theory of generative grammar. As a political commentator, has been one of the most prominent critics of US foreign policy, capitalism, and corporate media. Author of Manufacturing Consent and dozens of works on politics and power.',
    progressive_analysis = 'Chomsky''s Manufacturing Consent (with Edward Herman) provided a systematic "propaganda model" demonstrating how corporate media manufactures public support for elite interests, giving the left essential tools for media criticism and counter-narrative construction. His decades of meticulous documentation of US imperial interventions and their human costs have made him the most widely read critic of American foreign policy in the world. His commitment to making radical analysis accessible to popular audiences, combined with his insistence on intellectual independence, has made him a unique bridge between academic theory and grassroots activism.'
WHERE name LIKE '%Noam Chomsky%' AND bio_short IS NULL;

-- Howard Zinn
UPDATE people SET
    bio_short = 'American historian, playwright, and social activist (1922-2010). Professor at Boston University and veteran of the civil rights and anti-war movements. Author of A People''s History of the United States (1980), which presented American history from the perspective of workers, Indigenous peoples, women, and the oppressed. Sold over two million copies, transforming popular understanding of US history.',
    progressive_analysis = 'Zinn''s A People''s History democratized radical historiography by making the suppressed stories of workers, enslaved people, Indigenous nations, and social movements accessible to millions of readers outside academia. His insistence that "you can''t be neutral on a moving train" challenged the pretense of objectivity in mainstream historical scholarship, revealing it as a mask for the perspectives of the powerful. His work inspired generations of teachers and activists to recover the hidden history of resistance from below.'
WHERE name LIKE '%Howard Zinn%' AND bio_short IS NULL;

-- Simone de Beauvoir
UPDATE people SET
    bio_short = 'French existentialist philosopher, feminist theorist, novelist, and activist (1908-1986). Author of The Second Sex (1949), a foundational text of modern feminism that analyzed women''s oppression as a social construction. Partner of Jean-Paul Sartre. Active in the French resistance, Algerian independence movement, and women''s liberation movement.',
    progressive_analysis = 'De Beauvoir''s declaration that "one is not born, but rather becomes, a woman" established the theoretical framework for understanding gender as a social construction rather than a biological destiny, a insight that transformed feminist theory and practice. The Second Sex''s analysis of how women are constituted as the "Other" connected feminist struggle to broader existentialist and Marxist critiques of domination and alienation. Her work demonstrated that the liberation of women requires not merely legal equality but a fundamental transformation of the social structures that produce gendered subjectivity.'
WHERE name LIKE '%Simone de Beauvoir%' AND bio_short IS NULL;

-- Angela Davis
UPDATE people SET
    bio_short = 'American political activist, philosopher, and scholar (born 1944). Prominent member of the Communist Party USA and associated with the Black Panther Party. Wrongfully imprisoned in 1970-72, sparking an international "Free Angela Davis" campaign. Professor emerita at UC Santa Cruz. Leading voice on prison abolition, racial justice, and the intersection of race, gender, and class oppression.',
    progressive_analysis = 'Davis''s theoretical work on the prison-industrial complex as a continuation of racial capitalism and slavery has been foundational to the modern abolitionist movement, reframing mass incarceration as a structural feature of racial capitalism rather than a response to crime. Her insistence on the intersectionality of race, gender, and class oppression, rooted in her lived experience as a Black communist woman, challenged single-issue approaches within both the feminist and anti-racist movements. Her survival of state persecution and decades of sustained activism model the endurance required for revolutionary commitment.'
WHERE name LIKE '%Angela Davis%' AND bio_short IS NULL;

-- bell hooks
UPDATE people SET
    bio_short = 'American author, feminist theorist, and social critic (1952-2021). Born Gloria Jean Watkins, she adopted her pen name in lowercase to center attention on her work rather than her persona. Author of over 30 books including Ain''t I a Woman, Feminist Theory: From Margin to Center, and All About Love. Explored intersections of race, capitalism, gender, and their role in perpetuating systems of oppression.',
    progressive_analysis = 'hooks''s insistence on centering the experiences of Black women and other marginalized groups within feminist discourse fundamentally challenged the white, middle-class assumptions of mainstream feminism, arguing that feminism without anti-racism and class analysis is incomplete. Her concept of "imperialist white supremacist capitalist patriarchy" as an interlocking system of domination provided an accessible framework for understanding intersectional oppression. Her commitment to writing in clear, accessible language democratized feminist theory and brought radical ideas to audiences far beyond the academy.'
WHERE name LIKE '%bell hooks%' AND bio_short IS NULL;

-- Paulo Freire
UPDATE people SET
    bio_short = 'Brazilian educator, philosopher, and advocate for critical pedagogy (1921-1997). Author of Pedagogy of the Oppressed (1968), one of the most influential works in the history of education. Developed a revolutionary approach to literacy education that linked learning to political consciousness-raising. Exiled from Brazil after the 1964 military coup. Later served as Secretary of Education of Sao Paulo.',
    progressive_analysis = 'Freire''s Pedagogy of the Oppressed transformed education from a tool of social reproduction into a practice of liberation, arguing that the oppressed must become active subjects of their own emancipation through critical consciousness (conscientizacao). His critique of the "banking model" of education, in which students are passive recipients of dominant ideology, revealed how educational institutions function as instruments of class domination. His dialogical method of education has been adopted by social movements worldwide as a tool for grassroots political organizing and consciousness-raising.'
WHERE name LIKE '%Paulo Freire%' AND bio_short IS NULL;

-- Walter Benjamin
UPDATE people SET
    bio_short = 'German Jewish philosopher, cultural critic, and essayist (1892-1940). Associated with the Frankfurt School. Author of Illuminations, The Arcades Project, and the landmark essay "The Work of Art in the Age of Mechanical Reproduction." Combined Marxism, Jewish mysticism, and modernist aesthetics. Died by suicide while fleeing Nazi persecution at the French-Spanish border.',
    progressive_analysis = 'Benjamin''s Theses on the Philosophy of History, with its injunction to "brush history against the grain," provided a messianic Marxism that refused the progressivist narrative of inevitable socialist triumph, insisting instead on the urgency of revolutionary interruption. His analysis of the aestheticization of politics under fascism and the politicization of art under communism remains essential for understanding the cultural dimensions of political struggle. His tragic death fleeing fascism embodies the catastrophe he theorized, while his fragmentary, poetic method of materialist analysis continues to inspire leftist cultural criticism.'
WHERE name LIKE '%Walter Benjamin%' AND bio_short IS NULL;

-- Louis Althusser
UPDATE people SET
    bio_short = 'French Marxist philosopher (1918-1990). Leading theorist of structural Marxism and member of the French Communist Party. Author of For Marx and Reading Capital. Developed influential concepts including ideological state apparatuses, interpellation, and the epistemological break in Marx''s thought. His later life was marked by personal tragedy, including the killing of his wife in 1980.',
    progressive_analysis = 'Althusser''s theory of ideological state apparatuses revealed how institutions like schools, churches, and media reproduce capitalist social relations through ideology rather than direct coercion, extending Gramsci''s analysis of hegemony. His concept of interpellation, describing how ideology "hails" individuals as subjects, provided a mechanism for understanding how people come to accept their own subordination. His structural reading of Marx, emphasizing the relative autonomy of the political and ideological from the economic, liberated Marxist analysis from crude economic determinism.'
WHERE name LIKE '%Louis Althusser%' AND bio_short IS NULL;

-- Slavoj Zizek
UPDATE people SET
    bio_short = 'Slovenian philosopher, cultural critic, and public intellectual (born 1949). Senior researcher at the University of Ljubljana. Known for combining Lacanian psychoanalysis with Marxist critique and Hegelian philosophy. Prolific author of works including The Sublime Object of Ideology, Living in the End Times, and numerous commentaries on popular culture and contemporary politics.',
    progressive_analysis = 'Zizek''s synthesis of Lacanian psychoanalysis and Marxism has provided powerful tools for understanding how ideology functions at the level of desire and enjoyment, not merely belief, explaining why people often act against their own interests. His provocative critiques of liberal multiculturalism, humanitarian interventionism, and the "beautiful soul" posture of Western progressives have challenged comfortable leftist positions and pushed for more rigorous anti-capitalist analysis. His ability to communicate radical theory through popular culture references has brought Marxist and psychoanalytic critique to unusually wide audiences.'
WHERE name LIKE '%Slavoj%' AND bio_short IS NULL;

-- David Harvey
UPDATE people SET
    bio_short = 'British Marxist geographer and social theorist (born 1935). Distinguished Professor at the City University of New York. Author of The Condition of Postmodernity, A Brief History of Neoliberalism, and The Limits to Capital. Pioneer of Marxist geography who analyzed the spatial dynamics of capitalism. His free online lectures on Marx''s Capital have been accessed by millions worldwide.',
    progressive_analysis = 'Harvey''s concept of "accumulation by dispossession" extended Marx''s theory of primitive accumulation to explain ongoing processes of privatization, financialization, and the enclosure of commons under neoliberalism, providing essential analytical tools for contemporary anti-capitalist movements. His geographical materialism demonstrated how capitalism produces and reproduces spatial inequality, showing that urbanization, gentrification, and uneven development are not market failures but structural features of capitalist accumulation. His commitment to making Marx accessible through free lectures and clear writing has educated a new generation of leftists in the fundamentals of Marxist political economy.'
WHERE name LIKE '%David Harvey%' AND bio_short IS NULL;

-- Cornel West
UPDATE people SET
    bio_short = 'American philosopher, political activist, public intellectual, and democratic socialist (born 1953). Author of Race Matters and Democracy Matters. Has taught at Harvard, Princeton, Yale, and the Union Theological Seminary. Combines prophetic Christianity, Marxism, and the Black radical tradition. Presidential candidate in 2024. Known for his passionate advocacy for racial justice, economic democracy, and anti-imperialism.',
    progressive_analysis = 'West''s fusion of the Black prophetic tradition with Marxist class analysis and democratic socialism has created a unique voice in American radical politics, insisting that racial justice and economic justice are inseparable. His concept of "prophetic pragmatism" seeks to ground radical critique in the lived experiences of the oppressed while maintaining a vision of transformative possibility. His willingness to critique both conservative racism and liberal complacency, including challenging figures within the Black political establishment, embodies the independent radical intellectual tradition.'
WHERE name LIKE '%Cornel West%' AND bio_short IS NULL;

-- Peter Kropotkin
UPDATE people SET
    bio_short = 'Russian anarchist, geographer, scientist, and political theorist (1842-1921). Prince by birth who renounced his title for revolutionary activism. Author of Mutual Aid: A Factor of Evolution, The Conquest of Bread, and Fields, Factories and Workshops. Developed anarcho-communism as a coherent political theory, arguing that cooperation rather than competition is the primary driver of evolution and social organization.',
    progressive_analysis = 'Kropotkin''s Mutual Aid challenged Social Darwinism by demonstrating through rigorous scientific observation that cooperation, not competition, is the dominant factor in the evolution of species and human societies, undermining a key ideological justification for capitalism. His vision of anarcho-communism, based on decentralized federations of self-governing communes and workers'' cooperatives, offered a libertarian alternative to both capitalist exploitation and authoritarian state socialism. His work remains foundational for anarchist, communalist, and cooperative movements worldwide.'
WHERE name LIKE '%Peter Kropotkin%' AND bio_short IS NULL;

-- Mikhail Bakunin
UPDATE people SET
    bio_short = 'Russian revolutionary anarchist and political theorist (1814-1876). Principal founder of collectivist anarchism and a leading figure in the First International, where he clashed with Marx over the role of the state in revolution. Author of God and the State and Statism and Anarchy. Participated in revolutionary uprisings across Europe. His critique of Marxist authoritarianism proved prescient.',
    progressive_analysis = 'Bakunin''s warnings that a "dictatorship of the proletariat" would inevitably become a dictatorship over the proletariat proved remarkably prophetic in light of the authoritarian trajectory of 20th-century communist states. His insistence that economic liberation without the destruction of the state would merely create a new ruling class challenged the fundamental premises of Marxist-Leninist strategy. His vision of revolution as the spontaneous self-organization of the oppressed, rather than the seizure of state power by a vanguard, continues to inspire anarchist and libertarian socialist movements.'
WHERE name LIKE '%Mikhail Bakunin%' AND bio_short IS NULL;

-- Emma Goldman
UPDATE people SET
    bio_short = 'Lithuanian-born American anarchist, political activist, and writer (1869-1940). Known as "Red Emma," she was a prominent advocate for anarchism, women''s rights, birth control, free speech, and labor organizing. Author of Anarchism and Other Essays. Deported from the United States in 1919. Witnessed and criticized the Bolshevik suppression of dissent in Russia. Supported the Spanish anarchists during the Civil War.',
    progressive_analysis = 'Goldman''s anarcho-feminism connected the struggle against capitalism and the state to the liberation of women, challenging the patriarchal assumptions of both mainstream society and the male-dominated radical left. Her critique of the Bolshevik Revolution from a libertarian socialist perspective, based on direct observation, provided an early and principled left critique of authoritarian communism. Her insistence that revolution must encompass all dimensions of human freedom, including sexuality, art, and personal autonomy, expanded the horizons of radical politics beyond the purely economic.'
WHERE name LIKE '%Emma Goldman%' AND bio_short IS NULL;

-- C.L.R. James
UPDATE people SET
    bio_short = 'Trinidadian historian, journalist, socialist theorist, and cricket writer (1901-1989). Author of The Black Jacobins (1938), the landmark Marxist history of the Haitian Revolution. Active in Pan-African and Trotskyist movements in Britain and the United States. His work connected the African diaspora''s struggles to the global fight against capitalism and colonialism.',
    progressive_analysis = 'James''s The Black Jacobins was the first major work to center the agency of enslaved people in the Haitian Revolution, demonstrating that the most radical democratic revolution of the 18th century was led by those at the very bottom of the colonial hierarchy. His theoretical work connecting race, colonialism, and class struggle bridged the gap between Western Marxism and anti-colonial movements, insisting that Black liberation was not peripheral but central to the global struggle against capitalism. His intellectual range, spanning history, politics, philosophy, and even cricket, modeled a Marxism engaged with the full richness of human culture.'
WHERE name LIKE '%C.L.R. James%' AND bio_short IS NULL;

-- Eric Hobsbawm
UPDATE people SET
    bio_short = 'British Marxist historian (1917-2012). Born in Egypt to British parents, raised in Vienna and Berlin before moving to Britain. Author of the influential "Age of" tetralogy spanning from 1789 to 1991. Long-time member of the Communist Party of Great Britain. Professor at Birkbeck, University of London. One of the most widely read historians of the 20th century.',
    progressive_analysis = 'Hobsbawm''s magisterial historical works, from The Age of Revolution through The Age of Extremes, provided generations of readers with a Marxist framework for understanding the rise, consolidation, and contradictions of the capitalist world system. His concept of "the invention of tradition" revealed how ruling classes manufacture historical continuity to legitimize their power, an insight with enduring relevance for ideological critique. His accessible, narrative-driven scholarship demonstrated that rigorous Marxist historiography could reach mass audiences without sacrificing analytical depth.'
WHERE name LIKE '%Eric Hobsbawm%' AND bio_short IS NULL;

-- E.P. Thompson
UPDATE people SET
    bio_short = 'British historian, writer, and anti-nuclear activist (1924-1993). Author of The Making of the English Working Class (1963), one of the most influential works of social history ever written. Pioneered "history from below," recovering the agency and culture of ordinary working people. Active in the New Left and the Campaign for Nuclear Disarmament.',
    progressive_analysis = 'Thompson''s The Making of the English Working Class rescued the history of early industrial workers from "the enormous condescension of posterity," demonstrating that class is not merely an economic category but a cultural and political relationship forged through lived experience and collective struggle. His insistence on recovering the agency of the oppressed, including their defeats and "lost causes," challenged both conservative and deterministic Marxist historiographies. His concept of "moral economy" and his method of history from below have been adopted by social movements worldwide as tools for building class consciousness.'
WHERE name LIKE '%E.P. Thompson%' AND bio_short IS NULL;

-- ============================================================================
-- LABOR & CIVIL RIGHTS LEADERS
-- ============================================================================

-- Eugene Debs
UPDATE people SET
    bio_short = 'American labor leader, socialist politician, and five-time presidential candidate for the Socialist Party of America (1855-1926). Led the Pullman Strike of 1894 and co-founded the Industrial Workers of the World (IWW). Imprisoned in 1918 for opposing US entry into World War I under the Espionage Act. Received nearly one million votes in the 1920 presidential election while in prison.',
    progressive_analysis = 'Debs''s transformation from a railway union organizer to America''s foremost socialist leader embodied the radicalization process that occurs when workers confront the full power of the capitalist state, as his imprisonment during the Pullman Strike led him from trade unionism to revolutionary socialism. His principled opposition to World War I, at the cost of his freedom, exemplified the anti-war tradition within the socialist movement. His declaration that "while there is a lower class, I am in it" remains the most eloquent expression of solidarity in American radical history.'
WHERE name LIKE '%Eugene Debs%' AND bio_short IS NULL;

-- Mother Jones
UPDATE people SET
    bio_short = 'Irish-American labor organizer and activist (1837-1930). Born Mary Harris Jones in Cork, Ireland. Known as "the most dangerous woman in America," she organized miners, led children''s marches against child labor, and fought for workers'' rights for over five decades. Active in the United Mine Workers and the founding of the Industrial Workers of the World.',
    progressive_analysis = 'Mother Jones''s decades of frontline organizing among the most exploited workers in America, particularly coal miners, demonstrated the power of direct action and solidarity in confronting corporate power and state violence. Her "Children''s Crusade" march from Philadelphia to President Roosevelt''s home drew national attention to the horrors of child labor, exemplifying her genius for dramatic action that forced public reckoning with capitalist exploitation. Her fearless defiance of mine owners, Pinkertons, and state militias at an advanced age made her a living symbol of indomitable working-class resistance.'
WHERE name LIKE '%Mother Jones%' AND bio_short IS NULL;

-- Joe Hill
UPDATE people SET
    bio_short = 'Swedish-American labor activist, songwriter, and member of the Industrial Workers of the World (1879-1915). Born Joel Emmanuel Hagglund in Sweden. Composed iconic labor songs including "The Preacher and the Slave" and "There Is Power in a Union." Convicted of murder on disputed evidence and executed in Utah. His last words, "Don''t mourn, organize," became a rallying cry for the labor movement.',
    progressive_analysis = 'Hill''s use of music and humor as organizing tools demonstrated the power of culture in building working-class solidarity, and his songs translated radical ideas into accessible forms that workers could sing on picket lines. His trial and execution on what many historians consider fabricated charges exemplified how the legal system has historically been weaponized against labor organizers who effectively challenge capitalist interests. His martyrdom and his final exhortation to "organize" rather than mourn transformed him into the labor movement''s most potent symbol of resistance transcending death.'
WHERE name LIKE '%Joe Hill%' AND bio_short IS NULL;

-- Martin Luther King Jr.
UPDATE people SET
    bio_short = 'American Baptist minister, civil rights leader, and Nobel Peace Prize laureate (1929-1968). Led the Montgomery Bus Boycott, the March on Washington, and campaigns in Birmingham and Selma. His strategy of nonviolent direct action transformed the civil rights movement. In his final years, increasingly spoke against capitalism, poverty, and the Vietnam War. Assassinated in Memphis, Tennessee.',
    progressive_analysis = 'King''s evolution from civil rights leader to critic of capitalism and imperialism, exemplified by his Poor People''s Campaign and his denunciation of the Vietnam War, revealed his understanding that racial justice was inseparable from economic justice and anti-militarism. His analysis that the "triple evils" of racism, poverty, and militarism were interconnected structural features of American society anticipated the intersectional analysis that would later become central to leftist thought. The systematic suppression of his radical economic critique in mainstream commemorations demonstrates how capitalist society sanitizes revolutionary figures to neutralize their challenge to the existing order.'
WHERE name LIKE '%Martin Luther King%' AND bio_short IS NULL;

-- Malcolm X
UPDATE people SET
    bio_short = 'American Muslim minister, human rights activist, and Black nationalist leader (1925-1965). Born Malcolm Little, he became a leading figure in the Nation of Islam before breaking with the organization and founding the Organization of Afro-American Unity. Advocated for Black self-determination, self-defense, and Pan-African solidarity. His Autobiography, co-written with Alex Haley, is a landmark of American literature. Assassinated in New York City.',
    progressive_analysis = 'Malcolm X''s uncompromising assertion of Black dignity and his rejection of the politics of respectability challenged the integrationist framework that sought Black inclusion in existing capitalist structures without transforming them. His later evolution toward internationalism and anti-capitalism, connecting the African American struggle to anti-colonial movements worldwide, represented a profoundly radical vision that threatened the American establishment. His insistence on self-defense and self-determination, in contrast to appeals to white conscience, influenced the Black Power movement, the Black Panthers, and all subsequent radical Black political organizing.'
WHERE name LIKE '%Malcolm X%' AND bio_short IS NULL;

-- Fred Hampton
UPDATE people SET
    bio_short = 'American activist and revolutionary socialist (1948-1969). Deputy Chairman of the Illinois chapter of the Black Panther Party. Organized the first Rainbow Coalition, uniting the Black Panthers with the Young Lords and Young Patriots Organization across racial lines. Established free breakfast programs and community health clinics. Assassinated at age 21 in an FBI-coordinated police raid on his apartment.',
    progressive_analysis = 'Hampton''s Rainbow Coalition, which built multiracial working-class solidarity across Black, Latino, and poor white communities, represented one of the most threatening developments to the American racial capitalist order, directly prompting the FBI''s decision to eliminate him. His emphasis on class unity across racial lines, grounded in concrete community organizing like free breakfast programs, demonstrated a practical socialism that addressed immediate material needs while building revolutionary consciousness. His assassination by the state at age 21 is among the most damning examples of the American government''s willingness to murder its own citizens to prevent effective multiracial working-class organization.'
WHERE name LIKE '%Fred Hampton%' AND bio_short IS NULL;

-- Nelson Mandela
UPDATE people SET
    bio_short = 'South African anti-apartheid revolutionary, political leader, and philanthropist (1918-2013). Leader of the African National Congress and co-founder of its armed wing, Umkhonto we Sizwe. Imprisoned for 27 years on Robben Island. Won the Nobel Peace Prize in 1993 and became South Africa''s first Black president (1994-1999). His presidency focused on reconciliation and dismantling apartheid.',
    progressive_analysis = 'Mandela''s willingness to take up armed struggle against apartheid when peaceful avenues were exhausted, and his subsequent negotiated transition to democracy, embody the strategic flexibility that characterizes effective liberation movements. His 27 years of imprisonment without breaking transformed him into a global symbol of resistance to racial oppression. The limitations of post-apartheid South Africa, where political liberation was achieved without fundamental economic transformation, illustrate the ongoing challenge of translating political freedom into economic justice, a tension Mandela himself acknowledged.'
WHERE name LIKE '%Nelson Mandela%' AND bio_short IS NULL;

-- Steve Biko
UPDATE people SET
    bio_short = 'South African anti-apartheid activist and founder of the Black Consciousness Movement (1946-1977). Founded the South African Students'' Organisation (SASO) and the Black People''s Convention. Developed Black Consciousness philosophy emphasizing psychological liberation from internalized racial inferiority. Banned, arrested, and murdered in police custody at age 30. His death sparked international outrage against the apartheid regime.',
    progressive_analysis = 'Biko''s Black Consciousness philosophy, drawing on Fanon''s analysis of the psychology of colonization, understood that political liberation required first overcoming the internalized inferiority that white supremacy produces in the oppressed. His insistence that Black people must lead their own liberation, rejecting the paternalism of white liberals, paralleled similar arguments within the Black Power movement in the United States. His murder in police custody and the regime''s attempt to cover it up became a turning point in international opposition to apartheid, demonstrating how state violence against radical leaders can catalyze the movements they sought to destroy.'
WHERE name LIKE '%Steve Biko%' AND bio_short IS NULL;

-- Desmond Tutu
UPDATE people SET
    bio_short = 'South African Anglican cleric, theologian, and human rights activist (1931-2021). Nobel Peace Prize laureate (1984) and Archbishop of Cape Town. Prominent leader of the anti-apartheid movement who advocated for nonviolent resistance, economic sanctions, and reconciliation. Chaired the Truth and Reconciliation Commission. Continued to speak out against injustice, inequality, and oppression throughout his life.',
    progressive_analysis = 'Tutu''s liberation theology fused Christian ethics with anti-apartheid struggle, providing moral authority that was instrumental in mobilizing international opposition to the apartheid regime and building the sanctions movement. His leadership of the Truth and Reconciliation Commission attempted to forge a new model of transitional justice that prioritized truth-telling and healing over retribution. His continued advocacy for Palestinian rights, LGBTQ+ equality, and economic justice after apartheid demonstrated that genuine commitment to human liberation transcends any single cause or national boundary.'
WHERE name LIKE '%Desmond Tutu%' AND bio_short IS NULL;

-- Cesar Chavez
UPDATE people SET
    bio_short = 'American labor leader, community organizer, and civil rights activist (1927-1993). Co-founded the National Farm Workers Association (later the United Farm Workers) with Dolores Huerta. Led the Delano grape strike and nationwide boycotts that brought attention to the exploitation of agricultural workers. Used nonviolent tactics including fasting, marches, and consumer boycotts to win union contracts for farmworkers.',
    progressive_analysis = 'Chavez''s organization of farmworkers, among the most exploited and marginalized workers in America, demonstrated that even those excluded from the protections of the National Labor Relations Act could build effective collective power through direct action and community solidarity. His innovative use of consumer boycotts connected urban consumers to the conditions of rural agricultural labor, building cross-class alliances that expanded the reach of the labor movement. His integration of Mexican American cultural identity with labor organizing showed how ethnic solidarity could strengthen rather than fragment class-based movements.'
WHERE name LIKE '%Cesar Chavez%' AND bio_short IS NULL;

-- Dolores Huerta
UPDATE people SET
    bio_short = 'American labor leader, civil rights activist, and community organizer (born 1930). Co-founded the United Farm Workers with Cesar Chavez. Coined the iconic slogan "Si, se puede" ("Yes, we can"). Negotiated contracts that improved wages and working conditions for farmworkers. Played a leading role in organizing grape boycotts and political campaigns. Continues to advocate for workers'' rights, immigrants'' rights, and women''s empowerment.',
    progressive_analysis = 'Huerta''s role as co-founder and lead negotiator of the UFW has been historically underrecognized compared to Chavez, reflecting the systemic erasure of women''s leadership in labor and social movements. Her ability to organize across lines of gender, ethnicity, and citizenship status demonstrated the intersectional character of farmworker struggle and prefigured contemporary movements linking labor, immigrant, and women''s rights. Her enduring activism over seven decades embodies the sustained commitment required to challenge deeply entrenched systems of exploitation.'
WHERE name LIKE '%Dolores Huerta%' AND bio_short IS NULL;

-- Bobby Sands
UPDATE people SET
    bio_short = 'Irish republican activist and member of the Provisional IRA (1954-1981). Led the 1981 hunger strike in the Maze Prison demanding political prisoner status from the British government. Elected to the British Parliament for Fermanagh and South Tyrone while on hunger strike. Died after 66 days without food at age 27. His death and those of nine fellow hunger strikers transformed the Irish republican movement.',
    progressive_analysis = 'Sands''s hunger strike represented the ultimate expression of resistance by the colonized body against imperial power, transforming the prison itself into a site of anti-colonial struggle. His election to Parliament while on hunger strike demonstrated the depth of popular support for the republican cause that the British government sought to delegitimize through its criminalization policy. The hunger strike''s aftermath fundamentally reshaped Irish republican strategy, catalyzing Sinn Fein''s entry into electoral politics and the political process that eventually led to the Good Friday Agreement.'
WHERE name LIKE '%Bobby Sands%' AND bio_short IS NULL;

-- James Connolly
UPDATE people SET
    bio_short = 'Irish republican, socialist leader, and trade unionist (1868-1916). Born in Edinburgh to Irish immigrant parents. Co-founded the Irish Socialist Republican Party and the Irish Citizen Army. Author of Labour in Irish History. Led the Irish Citizen Army during the 1916 Easter Rising alongside Patrick Pearse. Executed by British firing squad while strapped to a chair due to his injuries.',
    progressive_analysis = 'Connolly''s synthesis of socialism and Irish republicanism, his insistence that national liberation without social emancipation would merely produce "a change of masters," remains the most important theoretical contribution to Irish revolutionary thought. His organization of the Irish Citizen Army as a workers'' militia demonstrated that the working class could be an independent military force in the struggle for national liberation. His execution by the British cemented the link between labor struggle and national liberation that continues to define the Irish republican socialist tradition.'
WHERE name LIKE '%James Connolly%' AND bio_short IS NULL;

-- ============================================================================
-- MODERN LEFTIST FIGURES
-- ============================================================================

-- Naomi Klein
UPDATE people SET
    bio_short = 'Canadian author, journalist, social activist, and filmmaker (born 1970). Author of No Logo, The Shock Doctrine, This Changes Everything, and On Fire. Her work analyzes the intersection of corporate globalization, disaster capitalism, and climate change. Professor at the University of British Columbia. One of the most influential progressive public intellectuals of her generation.',
    progressive_analysis = 'Klein''s concept of "disaster capitalism" in The Shock Doctrine revealed how economic elites exploit crises to impose neoliberal restructuring, providing the left with a powerful framework for understanding the relationship between catastrophe and capitalist accumulation. Her work on climate change has been instrumental in connecting environmental destruction to capitalism, arguing that addressing the climate crisis requires systemic economic transformation rather than market-based solutions. Her accessible, investigative approach to radical critique has brought anti-capitalist analysis to mainstream audiences worldwide.'
WHERE name LIKE '%Naomi Klein%' AND bio_short IS NULL;

-- Mark Fisher
UPDATE people SET
    bio_short = 'British cultural theorist, writer, and political commentator (1968-2017). Co-founder of Zero Books and lecturer at Goldsmiths, University of London. Author of Capitalist Realism: Is There No Alternative?, Ghosts of My Life, and The Weird and the Eerie. His influential blog k-punk defined a generation of critical writing on culture and politics.',
    progressive_analysis = 'Fisher''s concept of "capitalist realism," the pervasive sense that capitalism is the only viable economic system and that no alternative is imaginable, provided the definitive diagnosis of the ideological condition of the post-Cold War era. His analysis of how mental health crises, cultural stagnation, and the "slow cancellation of the future" are structural products of neoliberal capitalism connected personal suffering to systemic critique with devastating clarity. His work has become essential reading for a new generation of leftists seeking to understand and overcome the ideological paralysis of late capitalism.'
WHERE name LIKE '%Mark Fisher%' AND bio_short IS NULL;

-- David Graeber
UPDATE people SET
    bio_short = 'American anthropologist, anarchist activist, and author (1961-2020). Professor at the London School of Economics. Key figure in the Occupy Wall Street movement, credited with helping popularize the "We are the 99%" slogan. Author of Debt: The First 5,000 Years, Bullshit Jobs, and The Dawn of Everything. His work challenged fundamental assumptions about the origins of money, work, and social hierarchy.',
    progressive_analysis = 'Graeber''s Debt: The First 5,000 Years demolished the foundational myth of economics that money arose from barter, demonstrating instead that debt and social obligation preceded markets, thereby denaturalizing capitalist assumptions about human economic behavior. His concept of "bullshit jobs" articulated a widespread but previously untheorized alienation of the contemporary workforce, revealing how capitalism generates purposeless employment that degrades human dignity. His combination of rigorous anthropological scholarship with direct participation in movements like Occupy modeled an engaged intellectualism that refused the separation of theory and practice.'
WHERE name LIKE '%David Graeber%' AND bio_short IS NULL;

-- Silvia Federici
UPDATE people SET
    bio_short = 'Italian-American scholar, Marxist feminist, and activist (born 1942). Professor emerita at Hofstra University. Co-founded the International Feminist Collective and helped launch the Wages for Housework movement in the 1970s. Author of Caliban and the Witch, which analyzed the transition to capitalism through the lens of gender and the persecution of women. Leading theorist of reproductive labor and the commons.',
    progressive_analysis = 'Federici''s Caliban and the Witch reframed the transition to capitalism by demonstrating that the persecution of women, the enclosure of the commons, and the devaluation of reproductive labor were not incidental but constitutive features of primitive accumulation. Her analysis of unwaged domestic and care work as the hidden foundation of capitalist accumulation challenged Marxist orthodoxy''s neglect of reproductive labor and transformed feminist political economy. Her ongoing work on the commons as an alternative to both state and market has provided essential theoretical resources for contemporary movements against privatization and enclosure.'
WHERE name LIKE '%Silvia Federici%' AND bio_short IS NULL;

-- Jeremy Corbyn
UPDATE people SET
    bio_short = 'British politician and socialist activist (born 1949). Member of Parliament for Islington North since 1983. Leader of the Labour Party from 2015 to 2020. His leadership brought democratic socialist policies back to mainstream British politics, attracting mass membership. Long-standing campaigner for peace, nuclear disarmament, Palestinian rights, and trade union solidarity. Now sits as an independent MP.',
    progressive_analysis = 'Corbyn''s leadership of the Labour Party demonstrated both the potential and the obstacles facing a democratic socialist project within existing parliamentary structures, as his platform of nationalization, investment, and redistribution generated enormous popular enthusiasm while provoking fierce opposition from the media, the party establishment, and the security state. The coordinated campaign to destroy his leadership through manufactured antisemitism allegations, internal sabotage, and media hostility revealed the lengths to which the establishment will go to prevent even moderate social democratic reform. His experience remains an essential case study in the structural barriers to left-wing transformation through electoral politics.'
WHERE name LIKE '%Jeremy Corbyn%' AND bio_short IS NULL;

-- Jean-Luc Melenchon
UPDATE people SET
    bio_short = 'French politician and leader of La France Insoumise (France Unbowed) (born 1951). Former member of the Socialist Party and senator. Founded the Left Party in 2008 and La France Insoumise in 2016. Presidential candidate in 2012, 2017, and 2022, achieving his strongest result in 2022 with 22% of the vote. Advocates for ecological planning, a Sixth Republic, and exit from NATO.',
    progressive_analysis = 'Melenchon''s La France Insoumise represents one of the most significant attempts to build a mass left-populist movement in contemporary Europe, channeling popular discontent with austerity and neoliberalism into an anti-establishment political force. His advocacy for ecological planning that ties environmental transformation to social justice offers a model for integrating climate politics with class politics. His ability to unite diverse currents of the French left around a program of radical democratic reform has kept the prospect of transformative left governance alive in one of Europe''s major states.'
WHERE name LIKE '%lenchon%' AND bio_short IS NULL;

-- Bernie Sanders
UPDATE people SET
    bio_short = 'American politician and democratic socialist (born 1941). Independent senator from Vermont since 2007 and former mayor of Burlington (1981-1989). Ran for the Democratic presidential nomination in 2016 and 2020, building a mass movement around Medicare for All, free college tuition, a Green New Deal, and taxing the wealthy. His campaigns revived democratic socialism as a mainstream political force in America.',
    progressive_analysis = 'Sanders''s presidential campaigns broke the decades-long taboo on socialism in American politics, demonstrating that millions of Americans, particularly young people, were receptive to explicitly anti-capitalist messaging and policies like Medicare for All. His focus on the "billionaire class" and corporate greed reintroduced class analysis into mainstream American political discourse after decades of its suppression. While his campaigns ultimately fell short, the movement he built shifted the Overton window leftward and catalyzed a new generation of socialist organizing, including the dramatic growth of the Democratic Socialists of America.'
WHERE name LIKE '%Bernie Sanders%' AND bio_short IS NULL;

-- Yanis Varoufakis
UPDATE people SET
    bio_short = 'Greek-Australian economist, politician, and author (born 1961). Professor of economics and former Greek Minister of Finance (January-July 2015), where he confronted the Troika during the Greek debt crisis. Co-founded the Democracy in Europe Movement 2025 (DiEM25) and its Greek party MeRA25. Author of Adults in the Room and Technofeudalism: What Killed Capitalism.',
    progressive_analysis = 'Varoufakis''s confrontation with the Troika as Greek finance minister exposed in real time how European institutions enforce neoliberal austerity against the democratic will of member states, providing a dramatic lesson in the structural constraints on left governance within the EU. His concept of "technofeudalism" argues that platform capitalism has moved beyond traditional market dynamics into a new form of rent extraction, updating Marxist political economy for the digital age. His transnational organizing through DiEM25 represents an attempt to build pan-European left solidarity capable of challenging institutions that operate beyond the national level.'
WHERE name LIKE '%Yanis Varoufakis%' AND bio_short IS NULL;

-- Pablo Iglesias
UPDATE people SET
    bio_short = 'Spanish political scientist and politician (born 1978). Co-founder and former leader of Podemos (2014-2021). Named after the founder of the Spanish Socialist Workers'' Party. Served as Second Deputy Prime Minister of Spain from 2020 to 2021. His party grew out of the 15-M/Indignados anti-austerity movement and rapidly became a major force in Spanish politics.',
    progressive_analysis = 'Iglesias''s Podemos translated the energy of Spain''s Indignados movement into an electoral force that disrupted the country''s two-party system and brought anti-austerity, anti-corruption politics into the mainstream. His theoretical engagement with Gramsci and Laclau''s discourse theory represented an attempt to build a left-populist hegemonic project that could speak beyond the traditional left''s base. The party''s trajectory from insurgent movement to coalition partner illustrated both the possibilities and compromises inherent in pursuing transformative change through existing parliamentary institutions.'
WHERE name LIKE '%Pablo Iglesias%' AND bio_short IS NULL;

-- Subcomandante Marcos / EZLN
UPDATE people SET
    bio_short = 'Mexican insurgent and spokesperson for the Zapatista Army of National Liberation (EZLN) (born 1957 as Rafael Guillen Vicente). Led the 1994 Zapatista uprising in Chiapas on the day NAFTA took effect. Known for his trademark ski mask, pipe, and eloquent communiques blending poetry with political critique. Built autonomous indigenous communities in resistance to neoliberal globalization. Later took the name Subcomandante Galeano.',
    progressive_analysis = 'The Zapatista movement under Marcos''s spokesperson role created one of the most innovative models of anti-capitalist resistance, building autonomous indigenous governance structures that operate outside and against the logic of the state and capital. The EZLN''s uprising on the day NAFTA took effect brilliantly connected indigenous resistance to the broader struggle against neoliberal globalization, making the Zapatistas a reference point for the alter-globalization movement worldwide. Their practice of "leading by obeying" (mandar obedeciendo) and their rejection of state power as a goal have profoundly influenced anarchist and autonomist currents within the global left.'
WHERE name LIKE '%Subcomandante Marcos%' AND bio_short IS NULL;

-- Also try matching as "Marcos" for the EZLN in case stored differently
UPDATE people SET
    bio_short = 'Mexican insurgent and spokesperson for the Zapatista Army of National Liberation (EZLN) (born 1957 as Rafael Guillen Vicente). Led the 1994 Zapatista uprising in Chiapas on the day NAFTA took effect. Known for his trademark ski mask, pipe, and eloquent communiques blending poetry with political critique. Built autonomous indigenous communities in resistance to neoliberal globalization. Later took the name Subcomandante Galeano.',
    progressive_analysis = 'The Zapatista movement under Marcos''s spokesperson role created one of the most innovative models of anti-capitalist resistance, building autonomous indigenous governance structures that operate outside and against the logic of the state and capital. The EZLN''s uprising on the day NAFTA took effect brilliantly connected indigenous resistance to the broader struggle against neoliberal globalization, making the Zapatistas a reference point for the alter-globalization movement worldwide. Their practice of "leading by obeying" (mandar obedeciendo) and their rejection of state power as a goal have profoundly influenced anarchist and autonomist currents within the global left.'
WHERE name LIKE '%Rafael Guill%n Vicente%' AND bio_short IS NULL;

COMMIT;

-- ============================================================================
-- SUMMARY: 60+ UPDATE statements for major leftist/socialist figures
-- Covers: Revolutionary Leaders, Theorists & Intellectuals,
--         Labor & Civil Rights Leaders, Modern Leftist Figures
-- All updates conditional on bio_short IS NULL to avoid overwriting existing data
-- ============================================================================
