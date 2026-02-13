-- Update descriptions, significance, and progressive_analysis for major leftist books
-- Only updates rows where the respective field IS NULL to avoid overwriting existing data
-- Uses ILIKE with patterns to match titles flexibly

-- ============================================================================
-- POLITICAL THEORY & MANIFESTOS
-- ============================================================================

-- The Communist Manifesto (Marx & Engels, 1848)
UPDATE books SET description = 'A foundational political pamphlet by Karl Marx and Friedrich Engels, commissioned by the Communist League and published in 1848. It argues that the history of all hitherto existing society is the history of class struggles, and that under capitalism the proletariat is locked in conflict with the bourgeoisie. The Manifesto theorizes that capitalism will bring about its own destruction by polarizing and unifying the working class, predicting that revolution will lead to a classless society in which the free development of each is the condition for the free development of all.'
WHERE title ILIKE '%Communist Manifesto%' AND description IS NULL;

UPDATE books SET significance = 'One of the most influential political documents ever written, with over 500 million copies sold. It marked the shift from utopian socialism to scientific socialism and became the principal programmatic statement of European socialist and communist parties, inspiring countless political movements worldwide.'
WHERE title ILIKE '%Communist Manifesto%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'The foundational text of modern communist and socialist thought, providing the first systematic articulation of historical materialism and class struggle as the engine of history. Its call for workers of all countries to unite remains the bedrock of internationalist leftist organizing.'
WHERE title ILIKE '%Communist Manifesto%' AND progressive_analysis IS NULL;

-- Das Kapital (Marx, 1867)
UPDATE books SET description = 'Karl Marx''s magnum opus and a foundational text in Marxist philosophy, economics, and politics, offering a critical analysis of political economy and the capitalist mode of production. Beginning with an analysis of the commodity, Marx distinguishes between use value and exchange value, introduces the concept of surplus value to show how capitalists profit by paying workers less than the value their labor produces, and develops the theory of commodity fetishism. Published in three volumes (1867, 1885, 1894), only the first appeared in Marx''s lifetime, with Friedrich Engels completing the rest from Marx''s notes.'
WHERE title ILIKE '%Kapital%' AND description IS NULL;

UPDATE books SET significance = 'One of the most influential works of social science ever written, providing the intellectual foundation for the international labor movement, socialist and communist political parties, and academic disciplines including sociology, political science, and philosophy. It remains arguably the single most comprehensive critique of capitalism and diagnosis of its structural flaws ever produced.'
WHERE title ILIKE '%Kapital%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'The essential theoretical work for understanding capitalist exploitation, revealing how surplus value extraction operates at the heart of the wage-labor relationship. Its concepts of commodity fetishism, alienation, and the tendency of the rate of profit to fall remain indispensable tools for leftist economic analysis.'
WHERE title ILIKE '%Kapital%' AND progressive_analysis IS NULL;

-- The State and Revolution (Lenin, 1917)
UPDATE books SET description = 'Written by Vladimir Lenin in 1917 on the eve of the October Revolution, this work describes the role of the state in society, the necessity of proletarian revolution, and the theoretical inadequacies of social democracy. Lenin argues that the state is inherently a tool for class oppression and outlines the key features of a workers'' state: the armed people replacing the standing army, election and recall of all officials, restriction of officials'' salaries to workmen''s wages, and abolition of parliamentarianism in favor of workers'' councils with both legislative and executive functions.'
WHERE title ILIKE '%State and Revolution%' AND description IS NULL;

UPDATE books SET significance = 'Considered Lenin''s most important contribution to political theory, this work established the theoretical framework for revolutionary Marxism as distinct from reformism. Embraced by the international communist movement in the 1920s as a guiding document, its lessons were understood to apply not only to Russia but to all modern revolutions seeking to overturn bourgeois society.'
WHERE title ILIKE '%State and Revolution%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'A cornerstone of revolutionary Marxist theory, providing the clearest articulation of why the bourgeois state cannot simply be reformed but must be replaced by organs of workers'' power. Its model of workers'' democracy through elected, recallable delegates with real power continues to inform leftist visions of participatory governance.'
WHERE title ILIKE '%State and Revolution%' AND progressive_analysis IS NULL;

-- What Is to Be Done? (Lenin, 1902)
UPDATE books SET description = 'A political pamphlet written by Vladimir Lenin in 1901 and published in 1902, arguing that the working class will not become politically advanced simply by fighting economic battles with employers over wages and hours. Lenin contends that revolutionary consciousness must be brought to the working class by educated, professional revolutionaries organized in a disciplined vanguard party operating under democratic centralism, where internal democracy in discussion gives way to unified action once decisions are made.'
WHERE title ILIKE '%What Is to Be Done%' AND description IS NULL;

UPDATE books SET significance = 'This pamphlet laid the organizational foundations for the Bolshevik Party and, by extension, for the communist parties that would emerge worldwide in the 20th century. Its theory of the vanguard party became one of the most debated and consequential ideas in the history of revolutionary politics.'
WHERE title ILIKE '%What Is to Be Done%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'A pivotal text for understanding the relationship between revolutionary organization and class consciousness. Its argument that socialist theory must be actively brought to the working-class movement, rather than arising spontaneously, shaped the organizational practice of nearly every revolutionary party of the 20th century and continues to influence debates about political strategy on the left.'
WHERE title ILIKE '%What Is to Be Done%' AND progressive_analysis IS NULL;

-- Imperialism, the Highest Stage of Capitalism (Lenin, 1916/1917)
UPDATE books SET description = 'Written by Lenin in 1916 and published in 1917, this work analyzes how capitalism evolved from its competitive stage into a monopoly stage characterized by the concentration of production, the merging of bank and industrial capital into a financial oligarchy, and the export of capital. Lenin argues that imperialism is not merely a policy choice but the inevitable highest stage of capitalism, in which monopolies exploit labor and natural resources globally and super-profits from colonial exploitation allow the ruling class to bribe segments of the labor movement.'
WHERE title ILIKE '%Imperialism%Highest Stage%' AND description IS NULL;

UPDATE books SET significance = 'This work provided the Marxist framework for understanding modern imperialism, war, and colonialism as products of capitalist development rather than accidental policies. It explained why the international labor movement split during World War I and gave anti-colonial movements worldwide a theoretical basis for linking their struggles to the broader fight against capitalism.'
WHERE title ILIKE '%Imperialism%Highest Stage%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Essential reading for any leftist analysis of global inequality, war, and neo-colonialism. Lenin''s materialist analysis of how predatory wars flow from capitalist competition for markets and resources remains the foundation for anti-imperialist theory and continues to explain the dynamics of contemporary military interventions and economic exploitation of the Global South.'
WHERE title ILIKE '%Imperialism%Highest Stage%' AND progressive_analysis IS NULL;

-- The Prison Notebooks (Gramsci, 1929-1935)
UPDATE books SET description = 'A collection of fragmented notes, essays, and reflections written by Antonio Gramsci between 1929 and 1935 during his imprisonment by Mussolini''s fascist regime. The notebooks cover philosophy, history, economics, linguistics, literature, and education, but are best known for developing the concept of cultural hegemony: the process by which the ruling class maintains power not just through violence and economic coercion, but through ideological and cultural leadership that makes bourgeois values appear as universal common sense.'
WHERE title ILIKE '%Prison Notebooks%' AND description IS NULL;

UPDATE books SET significance = 'Gramsci''s concept of hegemony revolutionized Marxist theory by shifting focus from economic determinism to the complex interplay of ideology, culture, and the state in maintaining capitalist domination. The Prison Notebooks became one of the most influential works of 20th-century political thought, profoundly shaping cultural studies, political science, and social theory.'
WHERE title ILIKE '%Prison Notebooks%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Indispensable for understanding how capitalist power is maintained through cultural and ideological means beyond direct economic exploitation. Gramsci''s insight that cultural hegemony must be challenged before political power can be won has shaped leftist strategies from counter-hegemonic media to organic intellectuals embedded in working-class movements.'
WHERE title ILIKE '%Prison Notebooks%' AND progressive_analysis IS NULL;

-- History and Class Consciousness (Lukacs, 1923)
UPDATE books SET description = 'Published in 1923 by Hungarian Marxist philosopher Georg Lukacs, this collection of essays develops the theory of reification and advances Marx''s theory of class consciousness. Lukacs argues that capitalism turns every aspect of life into commodities for sale, and that reified forms such as corporations, profits, wages, and laws progressively sink deeper into human consciousness. The work posits that class consciousness arises when workers recognize themselves as the living human basis of the system rather than mere commodities, transforming from isolated individuals into a class capable of collective revolutionary action.'
WHERE title ILIKE '%History and Class Consciousness%' AND description IS NULL;

UPDATE books SET significance = 'One of the most important theoretical works to emerge from the revolutionary wave beginning in 1917, it is considered a founding text of Western Marxism. Its concept of reification influenced the entire Frankfurt School of critical theory and profoundly shaped subsequent Marxist philosophy, bridging the gap between economic analysis and the study of consciousness and culture.'
WHERE title ILIKE '%History and Class Consciousness%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'A crucial text for understanding how capitalism colonizes consciousness itself, making the structures of exploitation appear natural and inevitable. Lukacs''s insight that revolutionary practice requires not just changing material conditions but overcoming reified thinking remains central to leftist debates about ideology, false consciousness, and the possibility of radical transformation.'
WHERE title ILIKE '%History and Class Consciousness%' AND progressive_analysis IS NULL;

-- Reform or Revolution (Luxemburg, 1899)
UPDATE books SET description = 'A pamphlet by Polish-German Marxist theorist Rosa Luxemburg, first published in 1899 as a response to Eduard Bernstein''s revisionist arguments. Luxemburg argues that trade unions, reformist parties, and the expansion of social democracy, while important for developing working-class consciousness, cannot by themselves create a socialist society. She contends from a historical materialist perspective that capitalism is economically unsustainable and will eventually collapse, and that revolution is necessary to transform capitalism into socialism, while insisting that the daily struggle for reforms is the indispensable means through which the working class prepares for that revolution.'
WHERE title ILIKE '%Reform or Revolution%' AND description IS NULL;

UPDATE books SET significance = 'This pamphlet defined the central debate within the socialist movement between reform and revolution that persists to this day. It was heavily influential in revolutionary socialist circles and became an important precursor to left communist theory, demonstrating that at stake was not merely a tactical question but the very existence of socialism as a distinctive force against capitalism.'
WHERE title ILIKE '%Reform or Revolution%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'A foundational text for understanding the dialectical relationship between reform and revolution in leftist strategy. Luxemburg''s argument that reforms are the means and revolution the aim provides a framework for engaging in immediate struggles without losing sight of systemic transformation, a question that remains as urgent for the left today as it was in 1899.'
WHERE title ILIKE '%Reform or Revolution%' AND progressive_analysis IS NULL;

-- The Accumulation of Capital (Luxemburg, 1913)
UPDATE books SET description = 'Published in 1913 by Rosa Luxemburg, this work critiques Karl Marx''s theory of capitalist reproduction, arguing that capitalism requires access to non-capitalist markets and societies to solve the problem of realizing surplus value. Because workers receive less value than they create, they cannot purchase all that is produced, and capitalism must therefore violently conquer and absorb pre-capitalist areas of the world. Luxemburg posits that this necessity for external markets drives capitalist imperialism as competing states fight over what remains of the non-capitalist environment.'
WHERE title ILIKE '%Accumulation of Capital%' AND description IS NULL;

UPDATE books SET significance = 'Considered a foundational text in Marxist theories of imperialism, this work produced arguably the most comprehensive and theoretically sophisticated analysis of the connection between capitalism and imperialism of its era. It influenced later thinkers including Michal Kalecki, Henryk Grossman, and in the 21st century David Harvey, and generated significant debate that continues to enrich Marxist economic theory.'
WHERE title ILIKE '%Accumulation of Capital%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Luxemburg''s insight that capitalism structurally depends on the exploitation and destruction of non-capitalist societies provides a powerful framework for understanding colonialism, neo-colonialism, and the ongoing dispossession of indigenous peoples and the Global South as inherent features of the capitalist system, not unfortunate side effects.'
WHERE title ILIKE '%Accumulation of Capital%' AND progressive_analysis IS NULL;


-- ============================================================================
-- ANTI-COLONIAL & POST-COLONIAL
-- ============================================================================

-- The Wretched of the Earth (Fanon, 1961)
UPDATE books SET description = 'Published in 1961 by Martinican-Algerian philosopher and psychiatrist Frantz Fanon, this work provides a psychoanalysis of the dehumanizing effects of colonization upon the individual and the nation. Over five chapters, Fanon covers the patterns of how the colonized overthrow the colonist, how newly independent countries form national consciousness, and the devastating psychological effects of colonialism. The book''s core argument is that decolonization is inherently violent, a necessary response to the systemic violence of colonialism itself, and that the colonized must engage in revolutionary struggle to reclaim their full humanity.'
WHERE title ILIKE '%Wretched of the Earth%' AND description IS NULL;

UPDATE books SET significance = 'One of the most influential works of anti-colonial thought ever written, it profoundly shaped liberation struggles across Africa, Latin America, and the Caribbean. It influenced African leaders including Kwame Nkrumah and Sekou Toure, and in the United States inspired Black Panther Party leaders Bobby Seale, Huey P. Newton, and Eldridge Cleaver, providing a framework connecting anti-colonial struggle to Black liberation.'
WHERE title ILIKE '%Wretched of the Earth%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'An indispensable text for understanding decolonization as both a material and psychological process. Fanon''s analysis of how colonialism damages the psyche of the colonized, and his insistence that liberation requires the active agency of the oppressed rather than benevolent reform from above, remain central to anti-imperialist and liberation movements worldwide.'
WHERE title ILIKE '%Wretched of the Earth%' AND progressive_analysis IS NULL;

-- Black Skin, White Masks (Fanon, 1952)
UPDATE books SET description = 'Published in 1952 by Frantz Fanon, this autoethnographic work presents a historical critique of the psychological effects of racism and colonial domination. Fanon analyzes how colonialism corrupts the psyche of both Black and white people, arguing that the colonized adopt white masks by internalizing the culture and values of the colonizer while being perpetually denied full acceptance. Drawing on psychoanalysis, philosophy, and his own experiences as a Black man in the French Antilles and France, Fanon demonstrates how language, culture, and racial identification become vehicles of colonial oppression.'
WHERE title ILIKE '%Black Skin%White Masks%' AND description IS NULL;

UPDATE books SET significance = 'A seminal text in postcolonial theory and critical race studies, it is regarded as the unsurpassed study of the Black psyche in a white world. The book gained wider attention during the cultural upheavals of the 1960s and became a major influence on civil rights, anti-colonial, and Black consciousness movements internationally.'
WHERE title ILIKE '%Black Skin%White Masks%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Fanon''s pioneering analysis of how racism operates at the psychological level, creating internalized oppression and alienation in colonized peoples, remains essential for leftist understandings of racial domination. His work demonstrates that liberation must address not only material exploitation but the deep psychic wounds inflicted by centuries of colonial dehumanization.'
WHERE title ILIKE '%Black Skin%White Masks%' AND progressive_analysis IS NULL;

-- Orientalism (Said, 1978)
UPDATE books SET description = 'Published in 1978 by Palestinian-American literary theorist Edward Said, this work establishes Orientalism as a critical concept describing the Western world''s systematically distorted depiction of the Eastern world. Said argues that Western scholarship about the East is inextricably tied to the imperialist societies that produced it, showing how Orientalist writings actively shape the world they describe and perpetuate views of Middle Eastern and Asian peoples as inferior, exotic, and in need of Western intervention. The Orient, Said demonstrates, exists for and is constructed in relation to the West.'
WHERE title ILIKE '%Orientalism%' AND description IS NULL;

UPDATE books SET significance = 'A foundational document of postcolonialism, often credited with establishing the field of postcolonial studies. It provided a framework and method of analysis that significantly influenced fields across the humanities including cultural studies, anthropology, comparative literature, and political science, fundamentally changing how scholars understand the relationship between knowledge and imperial power.'
WHERE title ILIKE '%Orientalism%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Said''s revelation that Western knowledge production about the East serves imperial power rather than objective truth remains essential for leftist critiques of media, academia, and foreign policy. His work provides the analytical tools to deconstruct how racist and imperialist assumptions are embedded in supposedly neutral scholarship, justifying intervention and domination.'
WHERE title ILIKE '%Orientalism%' AND progressive_analysis IS NULL;

-- Discourse on Colonialism (Cesaire, 1950)
UPDATE books SET description = 'An essay by Martinican poet and politician Aime Cesaire, first published in 1950, arguing that colonialism was never a benevolent civilizing mission but purely a system of economic exploitation. Cesaire exposes the hypocrisy of European civilization by equating colonialism with barbarism, arguing that the colonizers who claimed to rid colonized lands of savagery were themselves the true savages through their campaigns of killing, rape, and destruction. He connects the violence of colonialism abroad to the rise of fascism in Europe, arguing that Hitler applied to Europeans the colonial methods previously reserved for non-white peoples.'
WHERE title ILIKE '%Discourse on Colonialism%' AND description IS NULL;

UPDATE books SET significance = 'A foundational text of postcolonial literature, described as a declaration of war on colonialism. It profoundly influenced the generation of scholars and activists at the forefront of liberation struggles in Africa, Latin America, and the Caribbean, and later inspired a new generation engaged in the Civil Rights, Black Power, and antiwar movements in the United States.'
WHERE title ILIKE '%Discourse on Colonialism%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Cesaire''s devastating linkage of colonialism, fascism, and the moral bankruptcy of European civilization remains a powerful framework for leftist anti-imperialism. His argument that fascism was colonialism brought home to Europe challenges liberal narratives that treat racism and imperialism as aberrations rather than as central features of capitalist modernity.'
WHERE title ILIKE '%Discourse on Colonialism%' AND progressive_analysis IS NULL;

-- How Europe Underdeveloped Africa (Rodney, 1972)
UPDATE books SET description = 'Published in 1972 by Guyanese historian and political activist Walter Rodney, this work demonstrates how Africa was deliberately exploited and underdeveloped by European colonial regimes. Rodney''s central argument is that Africa developed Europe at the same rate that Europe underdeveloped Africa, defining underdevelopment not as the absence of development but as the active process by which societies become impoverished through their interaction with exploitative powers. The book reconstructs pre-colonial Africa''s developmental conditions, pre-expansionist Europe, and their respective contributions to each other''s present state.'
WHERE title ILIKE '%Europe Underdeveloped Africa%' AND description IS NULL;

UPDATE books SET significance = 'A cornerstone text for postcolonial African studies, revolutionary movements, and anti-imperialist scholarship. Fusing African history with underdevelopment theory, Marxism, and Black nationalism, it has been taught in universities across the Global South and remains central to debates on development, reparations, and global inequality.'
WHERE title ILIKE '%Europe Underdeveloped Africa%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Rodney''s systematic demonstration that African poverty is the direct result of European capitalist extraction rather than any innate deficiency fundamentally challenges liberal development narratives. His work provides the historical evidence base for demands for reparations and structural transformation of the global economic order.'
WHERE title ILIKE '%Europe Underdeveloped Africa%' AND progressive_analysis IS NULL;

-- Pedagogy of the Oppressed (Freire, 1968)
UPDATE books SET description = 'Written by Brazilian Marxist educator Paulo Freire between 1967 and 1968, this work develops a theory of education fitted to the needs of the disenfranchised and marginalized. Freire critiques the banking model of education that treats students as empty vessels to be filled with knowledge, proposing instead a problem-posing model that makes teachers and students more equal partners in analyzing the world and their conditions. He argues that the central human problem is dehumanization through injustice and exploitation, and that the oppressed must work together to identify their oppressors and seek liberation through critical consciousness.'
WHERE title ILIKE '%Pedagogy of the Oppressed%' AND description IS NULL;

UPDATE books SET significance = 'One of the foundational texts of critical pedagogy, it had an immediate impact on educational studies worldwide and has been translated into dozens of languages. By combining educational and political philosophy, Freire offered a theory of liberation that transformed how educators, community organizers, and activists understand the relationship between knowledge, power, and social change.'
WHERE title ILIKE '%Pedagogy of the Oppressed%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Freire''s insight that education is never politically neutral and that the banking model of schooling serves to maintain oppressive social structures remains foundational to leftist educational theory and practice. His concept of conscientization, the development of critical awareness through dialogue and praxis, continues to inform grassroots organizing and popular education movements worldwide.'
WHERE title ILIKE '%Pedagogy of the Oppressed%' AND progressive_analysis IS NULL;

-- Neocolonialism: The Last Stage of Imperialism (Nkrumah, 1965)
UPDATE books SET description = 'Published in 1965 by Kwame Nkrumah, the first president of independent Ghana, this work analyzes how European imperialism evolved from slavery through colonization to neocolonialism, which Nkrumah identifies as the final and most dangerous stage of imperialism. The book reveals that while formerly colonized states appear independent, they remain controlled by outside economic and political forces. Nkrumah shows how the West dispenses with its flags while maintaining domination through economic aid, monetary control, promotion of compliant civil servants, and corporate exploitation of resources.'
WHERE title ILIKE '%Neocolonialism%Last Stage%' AND description IS NULL;

UPDATE books SET significance = 'Nkrumah popularized the concept of neocolonialism, which appeared in the 1963 preamble of the Organisation of African Unity Charter and has since become one of the most important analytical frameworks for understanding post-independence power relations in the Global South. The book was so threatening to Western interests that the United States reportedly protested its publication.'
WHERE title ILIKE '%Neocolonialism%Last Stage%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Nkrumah''s analysis that political independence without economic sovereignty is meaningless remains the defining insight for understanding continued Western domination of formerly colonized nations. His framework explains how institutions like the IMF, World Bank, and multinational corporations perpetuate imperial control through debt, structural adjustment, and resource extraction.'
WHERE title ILIKE '%Neocolonialism%Last Stage%' AND progressive_analysis IS NULL;


-- ============================================================================
-- CRITICAL THEORY & PHILOSOPHY
-- ============================================================================

-- One-Dimensional Man (Marcuse, 1964)
UPDATE books SET description = 'Published in 1964 by Frankfurt School philosopher Herbert Marcuse, this work examines why Marx''s predicted working-class revolution has not occurred. Marcuse argues that advanced industrial society enslaves people through a seemingly high standard of living that simultaneously cultivates one-dimensional thinking, suppressing critical and creative faculties in favor of passive consumerism. Through advertising and mass media, the system creates false needs that individuals internalize, making them identify with the values of the dominant order and rendering genuine opposition nearly impossible.'
WHERE title ILIKE '%One-Dimensional Man%' AND description IS NULL;

UPDATE books SET significance = 'A key text of both the Frankfurt School and the New Left, described as one of the most subversive literary contributions of the 20th century. It influenced many in the New Left by articulating their dissatisfaction with both capitalist societies and Soviet communism, providing a theoretical foundation for the student movements and counterculture of the 1960s.'
WHERE title ILIKE '%One-Dimensional Man%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Marcuse''s analysis of how consumer capitalism absorbs and neutralizes opposition through the satisfaction of false needs remains urgently relevant in an age of social media, algorithmic manipulation, and lifestyle branding. His work challenges the left to examine how capitalist culture colonizes desire itself, making liberation seem unnecessary rather than impossible.'
WHERE title ILIKE '%One-Dimensional Man%' AND progressive_analysis IS NULL;

-- Dialectic of Enlightenment (Adorno & Horkheimer, 1947)
UPDATE books SET description = 'Written by Frankfurt School philosophers Max Horkheimer and Theodor Adorno, first circulated in 1944 and revised for publication in 1947, this work asks why humanity, instead of entering a truly human state, is sinking into a new kind of barbarism. The authors argue that the Enlightenment''s promise of liberation through reason has dialectically reversed into new forms of domination, culminating in fascism, Stalinism, and the culture industry of mass consumer capitalism. Their fundamental thesis is that myth is already enlightenment and enlightenment reverts to mythology, with reason itself transformed into an irrational force dominating both nature and humanity.'
WHERE title ILIKE '%Dialectic of Enlightenment%' AND description IS NULL;

UPDATE books SET significance = 'Undoubtedly the most influential publication of the Frankfurt School of Critical Theory, it fundamentally reshaped how intellectuals understood the relationship between reason, domination, and modernity. Its analysis of the culture industry as a system of social control, and its critique of instrumental reason, became foundational concepts in critical theory, cultural studies, and the philosophy of social science.'
WHERE title ILIKE '%Dialectic of Enlightenment%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'This work challenges simplistic leftist narratives of progress by revealing how the very tools of Enlightenment rationality can become instruments of domination. Its analysis of the culture industry as a mechanism for producing conformity and suppressing critical thought provides essential tools for understanding how capitalism maintains ideological control through entertainment, media, and consumer culture.'
WHERE title ILIKE '%Dialectic of Enlightenment%' AND progressive_analysis IS NULL;

-- Minima Moralia (Adorno, 1951)
UPDATE books SET description = 'Published in 1951 by Theodor Adorno, this collection of 153 aphorisms and short essays was begun during World War II while Adorno lived as an exile in America. The work reflects on how capitalism, fascism, and mass culture have damaged modern life, critiquing the alienation, conformity, and loss of individuality in contemporary society. Its ironic title suggests how little remains in the 20th century of morality or of the good life to which it might pertain, radiating a sense of catastrophe concealed behind deceptive pleasantry, written from the perspective of an intellectual driven into exile by fascism.'
WHERE title ILIKE '%Minima Moralia%' AND description IS NULL;

UPDATE books SET significance = 'One of the most distinctive works of 20th-century critical theory, combining philosophical rigor with literary brilliance. Its aphoristic form influenced generations of cultural critics and its central insight that there is no right life in the wrong one became a touchstone for understanding how systemic injustice pervades even the most intimate aspects of personal existence.'
WHERE title ILIKE '%Minima Moralia%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Adorno''s reflections on the impossibility of authentic life under capitalism challenge the left to reckon with how deeply commodification and alienation penetrate everyday existence. The work demonstrates that leftist critique must extend beyond political economy to encompass culture, psychology, and the texture of daily life under conditions of systemic domination.'
WHERE title ILIKE '%Minima Moralia%' AND progressive_analysis IS NULL;

-- The Society of the Spectacle (Debord, 1967)
UPDATE books SET description = 'Published in 1967 by Guy Debord, founding member of the Situationist International, this work consists of 221 short theses analyzing how authentic social life has been replaced by its representation in modern capitalist society. Debord argues that the spectacle is not merely a collection of images but a social relationship between people mediated by images, tracing the decline of being into having, and having into merely appearing. The quality of life is impoverished as human perceptions are degraded by the all-encompassing spectacle of consumer capitalism, hindering critical thought and authentic experience.'
WHERE title ILIKE '%Society of the Spectacle%' AND description IS NULL;

UPDATE books SET significance = 'Arguably the most important radical work of the 20th century, translated into more than twenty languages, and a seminal text of the Situationist movement. Once viewed by authorities with genuine alarm, its prescient analysis of image-saturated consumer culture anticipated the age of social media, reality television, and the total colonization of lived experience by mediated representation.'
WHERE title ILIKE '%Society of the Spectacle%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Debord''s analysis of how capitalism transforms all of life into a spectacle of passive consumption anticipated our current media landscape with uncanny precision. His framework provides essential tools for understanding how social media, celebrity culture, and the attention economy serve to pacify populations and prevent genuine political engagement.'
WHERE title ILIKE '%Society of the Spectacle%' AND progressive_analysis IS NULL;

-- Capitalist Realism (Fisher, 2009)
UPDATE books SET description = 'Published in 2009 by British philosopher and cultural theorist Mark Fisher, this work explores the widespread sense that not only is capitalism the only viable political and economic system, but that it is now impossible even to imagine a coherent alternative. Fisher likens capitalist realism to a pervasive atmosphere constraining thought and action, investigating its effects on popular culture, work, education, and mental health. He argues that the bank bailouts following the 2008 financial crisis were a quintessential example of capitalist realism in action, where allowing the banking system to fail was simply unimaginable to politicians and the public alike.'
WHERE title ILIKE '%Capitalist Realism%' AND description IS NULL;

UPDATE books SET significance = 'An unexpected success that has influenced a wide range of writers and activists, capturing the ideological mood of the post-2008 era. Fisher''s concept of capitalist realism, encapsulated by the phrase it is easier to imagine an end to the world than an end to capitalism, became one of the most widely cited ideas in contemporary leftist discourse.'
WHERE title ILIKE '%Capitalist Realism%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Fisher''s diagnosis of capitalist realism as a mental and cultural paralysis that prevents people from imagining alternatives to capitalism is essential for understanding why the left struggles to build mass movements despite widespread dissatisfaction. His linking of mental health crises to neoliberal capitalism opened new terrain for leftist analysis of how the system damages people at the most intimate psychological level.'
WHERE title ILIKE '%Capitalist Realism%' AND progressive_analysis IS NULL;

-- Manufacturing Consent (Chomsky & Herman, 1988)
UPDATE books SET description = 'Published in 1988 by Edward S. Herman and Noam Chomsky, this work argues that the mass media in the United States functions as an ideological institution carrying out system-supportive propaganda through market forces, internalized assumptions, and self-censorship rather than overt coercion. The book introduces the propaganda model with five filters: concentrated corporate ownership, advertising dependence, reliance on official sources, flak as a disciplinary mechanism, and anti-communism as ideology. Through case studies from the Vietnam War to coverage of worthy versus unworthy victims, the authors demonstrate how media systematically reinforces power.'
WHERE title ILIKE '%Manufacturing Consent%' AND description IS NULL;

UPDATE books SET significance = 'Honored with the Orwell Award for outstanding contributions to the critical analysis of public discourse, this work introduced the propaganda model of communication that remains influential in media studies. Its framework for understanding how supposedly free media serves ruling-class interests has become one of the most widely taught theories of media criticism.'
WHERE title ILIKE '%Manufacturing Consent%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'The propaganda model provides the left with a structural analysis of media bias that goes beyond claims of individual journalist bias to reveal how ownership, advertising, and sourcing practices systematically filter news in favor of corporate and state power. Its framework remains indispensable for understanding why mainstream media consistently marginalizes leftist perspectives and anti-war positions.'
WHERE title ILIKE '%Manufacturing Consent%' AND progressive_analysis IS NULL;


-- ============================================================================
-- FEMINIST & SOCIAL
-- ============================================================================

-- The Second Sex (Beauvoir, 1949)
UPDATE books SET description = 'Published in 1949 by French existentialist philosopher Simone de Beauvoir, this two-volume work examines the treatment of women throughout history and in contemporary society. Beauvoir''s primary thesis is that men fundamentally oppress women by characterizing them as the Other, defined exclusively in opposition to men. Her famous declaration that one is not born but becomes a woman articulates the distinction between biological sex and socially constructed gender, demonstrating through detailed analysis how girls are conditioned at every stage into accepting passivity, dependence, and inwardness.'
WHERE title ILIKE '%Second Sex%' AND description IS NULL;

UPDATE books SET significance = 'Regarded as a groundbreaking work of feminist philosophy and the starting inspiration of second-wave feminism, it profoundly influenced founders of the women''s liberation movement including Kate Millett, Shulamith Firestone, and Germaine Greer. Beauvoir''s articulation of the sex-gender distinction and her existentialist analysis of women''s oppression fundamentally transformed how gender relations are understood in philosophy, social science, and political activism.'
WHERE title ILIKE '%Second Sex%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Beauvoir''s demonstration that women''s subordination is socially constructed rather than biologically determined provided the theoretical foundation for feminist movements worldwide. Her existentialist insistence that women must claim their own subjectivity and freedom, rather than accepting the role of Other, remains central to leftist feminist thought and its challenge to patriarchal capitalism.'
WHERE title ILIKE '%Second Sex%' AND progressive_analysis IS NULL;

-- Caliban and the Witch (Federici, 2004)
UPDATE books SET description = 'Published in 2004 by Silvia Federici, this work traces the history of the body in the transition to capitalism, from the peasant revolts of the late Middle Ages through the witch-hunts to the rise of mechanical philosophy. Federici argues that the European witch-hunts of the 16th and 17th centuries were an attack on women''s resistance to the spread of capitalist relations, targeting their sexuality, control over reproduction, and healing abilities. She demonstrates that the subjugation of women was as crucial for the formation of the world proletariat as the enclosures of land, the conquest of the Americas, and the slave trade.'
WHERE title ILIKE '%Caliban and the Witch%' AND description IS NULL;

UPDATE books SET significance = 'A landmark contribution to Marxist-feminist theory that fundamentally reframes the history of primitive accumulation to include the war against women. By revealing the gendered violence at the origins of capitalism, the book has become essential reading in feminist, anti-capitalist, and decolonial circles and has influenced contemporary movements for reproductive justice and against the commodification of care work.'
WHERE title ILIKE '%Caliban and the Witch%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Federici''s insight that primitive accumulation is not merely a historical event but an ongoing process that continually requires the subordination of women and reproductive labor provides a crucial corrective to Marxist analyses that neglect gender. Her work demonstrates that capitalism cannot be understood or challenged without confronting patriarchy and the exploitation of women''s bodies and labor.'
WHERE title ILIKE '%Caliban and the Witch%' AND progressive_analysis IS NULL;

-- The Origin of the Family, Private Property and the State (Engels, 1884)
UPDATE books SET description = 'Published in 1884 by Friedrich Engels, partially based on notes by Karl Marx on Lewis Henry Morgan''s anthropological work Ancient Society. Using the method of historical materialism, Engels traces the development of the family through multiple stages, demonstrating that the oppression of women emerged historically with the production of a surplus and the division of society into classes. He argues that monogamous marriage as practiced in bourgeois society is a condition akin to slavery for women and children, and that private property and the state arose together as instruments of class domination.'
WHERE title ILIKE '%Origin of the Family%' AND description IS NULL;

UPDATE books SET significance = 'Described by Lenin as one of the fundamental works of modern socialism, it provided the first systematic Marxist analysis of women''s oppression as rooted in the emergence of private property and class society. The book became foundational for Marxist feminism, demonstrating that women''s liberation requires the abolition of class society and private property rather than merely legal reforms.'
WHERE title ILIKE '%Origin of the Family%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Engels''s demonstration that women''s oppression is not natural or eternal but arose historically with private property and class society remains the starting point for Marxist-feminist analysis. His argument that women''s emancipation requires economic independence and the transformation of social institutions rather than mere legal equality continues to inform socialist feminist strategy.'
WHERE title ILIKE '%Origin of the Family%' AND progressive_analysis IS NULL;

-- Gender Trouble (Butler, 1990)
UPDATE books SET description = 'Published in 1990 by philosopher Judith Butler, this work argues that gender is performative: no identity exists behind the acts that supposedly express gender, and these acts constitute rather than express the illusion of a stable gender identity. Butler challenges the central feminist assumption that there exists a unified identity of woman that requires political representation, arguing that categories like men and women are complicated by class, ethnicity, and sexuality. For Butler, gender is what you do, not who you are, and is maintained through iterative repetitions of culturally influenced acts.'
WHERE title ILIKE '%Gender Trouble%' AND description IS NULL;

UPDATE books SET significance = 'A founding text of queer theory that established Butler at the forefront of feminism, women''s studies, and lesbian and gay studies. The theory of gender performativity has profoundly influenced academic understandings of gender and identity, and has shaped and mobilized queer activism internationally, fundamentally changing how both scholars and activists think about the relationship between sex, gender, and political action.'
WHERE title ILIKE '%Gender Trouble%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Butler''s deconstruction of gender as a naturalized category challenges the left to examine how binary gender norms serve to reinforce systems of domination and exclusion. By revealing gender as performative rather than essential, the work opens space for more inclusive and intersectional leftist politics that recognize the diversity of embodied experience within movements for social transformation.'
WHERE title ILIKE '%Gender Trouble%' AND progressive_analysis IS NULL;


-- ============================================================================
-- MODERN LEFTIST
-- ============================================================================

-- A People's History of the United States (Zinn, 1980)
UPDATE books SET description = 'Published in 1980 by historian and activist Howard Zinn, this work retells American history from the perspective of the marginalized: women, factory workers, African Americans, Native Americans, the working poor, and immigrant laborers. Covering the period from Columbus''s arrival through the late 20th century, Zinn shows how many of America''s greatest advances, including fair wages, the eight-hour workday, child labor laws, universal suffrage, and racial equality, were won through grassroots struggle against fierce resistance from elites. He argues that structural inequalities have shaped everything from the writing of laws to how they are interpreted.'
WHERE title ILIKE '%People''s History of the United States%' AND description IS NULL;

UPDATE books SET significance = 'With over four million copies sold and translations into more than a dozen languages, it became one of the most widely read works of American history. By presenting history from below, Zinn demonstrated that America''s various radicalisms were not un-American but rather the force that propelled the nation toward more humane and democratic arrangements.'
WHERE title ILIKE '%People''s History of the United States%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Zinn''s radical reframing of American history as a story of class conflict, racial oppression, and popular resistance provides a powerful counter-narrative to nationalist mythology. His work demonstrates that every progressive gain in American history was won not by enlightened leaders but by organized movements of ordinary people fighting against entrenched power.'
WHERE title ILIKE '%People''s History of the United States%' AND progressive_analysis IS NULL;

-- The Shock Doctrine (Klein, 2007)
UPDATE books SET description = 'Published in 2007 by Canadian journalist and activist Naomi Klein, this work argues that neoliberal economic policies promoted by Milton Friedman and the Chicago school of economics have risen to prominence through a strategy of disaster capitalism. Klein demonstrates how political actors exploit the chaos of natural disasters, wars, coups, and economic crises to push through unpopular policies of deregulation and privatization while populations are too disoriented to resist. Tracing this pattern from Pinochet''s Chile through the Iraq War and Hurricane Katrina, the book reveals a fifty-year history of shock therapy economics imposed on vulnerable societies.'
WHERE title ILIKE '%Shock Doctrine%' AND description IS NULL;

UPDATE books SET significance = 'The book achieved considerable prominence in both academic and popular discourse and is considered among the most important works of political non-fiction of its decade. Klein''s concept of disaster capitalism provided a unifying framework for understanding how neoliberal restructuring has been imposed worldwide, from Latin America to Eastern Europe to the Middle East.'
WHERE title ILIKE '%Shock Doctrine%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Klein''s exposure of how ruling elites systematically exploit crises to advance privatization and deregulation provides the left with a crucial analytical framework. Her work demonstrates that neoliberalism was never implemented through democratic consent but through deliberate exploitation of collective trauma, revealing the fundamentally anti-democratic nature of free-market ideology.'
WHERE title ILIKE '%Shock Doctrine%' AND progressive_analysis IS NULL;

-- No Logo (Klein, 1999)
UPDATE books SET description = 'Published in 1999 by Naomi Klein, this work examines how globalization transformed corporations from product manufacturers into brand identity creators, outsourcing production to low-wage workers in developing countries while investing in marketing lifestyles and identities to consumers. Organized in four parts titled No Space, No Choice, No Jobs, and No Logo, Klein exposes sweatshop labor in the Americas and Asia, corporate censorship, the colonization of public space by advertising, and the emerging resistance movements including culture jamming and anti-corporate activism.'
WHERE title ILIKE '%No Logo%' AND description IS NULL;

UPDATE books SET significance = 'Published just as the anti-globalization movement erupted with the 1999 Seattle WTO protests, the book was called a movement bible by the New York Times. Its impact was immediate and lasting, establishing Klein as one of the foremost critics of corporate globalization and providing the intellectual framework for a generation of anti-corporate and anti-capitalist activism.'
WHERE title ILIKE '%No Logo%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Klein''s analysis of how global capitalism shifted from making products to selling branded identities while exploiting Third World labor reveals the cultural and economic dimensions of neoliberal globalization. Her work helped catalyze an international movement that connected sweatshop workers in the Global South with anti-corporate activists in the North, demonstrating the possibility of cross-border solidarity.'
WHERE title ILIKE '%No Logo%' AND progressive_analysis IS NULL;

-- Debt: The First 5,000 Years (Graeber, 2011)
UPDATE books SET description = 'Published in 2011 by anthropologist and anarchist activist David Graeber, this work explores the historical relationship of debt with social institutions including barter, marriage, slavery, law, religion, war, and government across 5,000 years of civilization. Graeber demolishes the myth that barter preceded money, showing that early societies used systems of credit and mutual obligation. He argues that the shift from imprecise, community-building indebtedness to mathematically precise, firmly enforced debt was accomplished through state-sponsored violence, and that humans operate morally through three forms of economic relations: baseline communism, exchange, and hierarchy.'
WHERE title ILIKE '%Debt%First 5%000 Years%' AND description IS NULL;

UPDATE books SET significance = 'An international bestseller that won the inaugural Bread and Roses Award for radical literature, published amid the Great Recession and European debt crisis. Written by a self-proclaimed anarchist considered the house theorist of the Occupy movement, it may be the most read work of public anthropology of the 21st century, fundamentally challenging conventional economic assumptions about the origins of money and markets.'
WHERE title ILIKE '%Debt%First 5%000 Years%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Graeber''s demolition of the myth that free markets arose naturally from barter reveals how debt has historically been imposed through violence and state power. His work provides the left with anthropological evidence that communistic sharing and mutual aid are more fundamental to human social life than market exchange, undermining the ideological foundations of capitalist economics.'
WHERE title ILIKE '%Debt%First 5%000 Years%' AND progressive_analysis IS NULL;

-- Bullshit Jobs (Graeber, 2018)
UPDATE books SET description = 'Published in 2018 by David Graeber, expanded from his viral 2013 essay, this work argues that a significant proportion of jobs in modern economies are completely pointless, unnecessary, or pernicious, yet employees feel obliged to pretend otherwise. Graeber defines bullshit jobs as roles whose elimination would make no discernible difference to the world, identifying categories including flunkies, goons, duct tapers, box tickers, and taskmasters. He argues that the productivity gains of automation have not led to reduced working hours, as Keynes predicted, but instead to the proliferation of meaningless work driven by managerial feudalism and a Puritan work ethic that equates employment with moral worth.'
WHERE title ILIKE '%Bullshit Jobs%' AND description IS NULL;

UPDATE books SET significance = 'The original 2013 essay received over one million views and was translated into twelve languages, with polls in Britain and the Netherlands confirming that 37-40% of workers believed their jobs made no meaningful contribution. The book crystallized a widespread but previously unarticulated sense that modern capitalism generates vast amounts of unnecessary labor, opening serious debate about the nature of work and the possibility of alternatives.'
WHERE title ILIKE '%Bullshit Jobs%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Graeber''s analysis reveals a fundamental paradox of capitalism: a system supposedly governed by efficiency systematically produces millions of pointless jobs while underpaying essential workers. His work strengthens the case for universal basic income, reduced working hours, and a fundamental revaluation of which labor actually matters, challenging the ideology that equates wage labor with human dignity.'
WHERE title ILIKE '%Bullshit Jobs%' AND progressive_analysis IS NULL;

-- The Open Veins of Latin America (Galeano, 1971)
UPDATE books SET description = 'Published in 1971 by Uruguayan journalist Eduardo Galeano, this work analyzes five centuries of the pillage of Latin America by European colonizers and subsequently by the United States. Rather than organizing history chronologically, Galeano traces the patterns of exploitation through specific commodities: gold and silver, cacao and cotton, rubber and coffee, petroleum, iron, copper, and tin. Drawing on dependency theory, the book argues that Latin America remains underdeveloped not due to internal failings but because its wealth has been systematically extracted to fuel the development of Europe and North America.'
WHERE title ILIKE '%Open Veins of Latin America%' AND description IS NULL;

UPDATE books SET significance = 'Banned in several Latin American military dictatorships, the book quickly became a reference for an entire generation of left-wing thinkers, students, and politicians across the continent. It fundamentally shifted how marginalized communities were perceived, no longer as underdeveloped but as actively exploited, and has had a transformational impact on developing anti-imperialist consciousness throughout Latin America.'
WHERE title ILIKE '%Open Veins of Latin America%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Galeano''s passionate documentation of how Latin American resources and labor have been systematically plundered for five centuries provides the historical foundation for understanding contemporary inequality between the Global North and South. His work remains essential for leftist movements demanding economic sovereignty, land reform, and an end to neo-colonial extraction.'
WHERE title ILIKE '%Open Veins of Latin America%' AND progressive_analysis IS NULL;

-- Chavs (Jones, 2011)
UPDATE books SET description = 'Published in 2011 by British political commentator Owen Jones, this work argues that the working class has been systematically stigmatized in public life through the figure of the chav, a term symbolizing vulgarity, criminality, and fecklessness. Jones traces the political roots of this class demonization to neoliberal reforms under Thatcherism, including the defeat of trade unions and the Right to Buy scheme, which fragmented working-class solidarity. He indicts both Conservative and New Labour governments for redirecting attention from structural inequality to individual moral failure, turning social exclusion into a behavioral issue rather than a socioeconomic one.'
WHERE title ILIKE '%Chavs%' AND description IS NULL;

UPDATE books SET significance = 'A widely influential polemic that reignited public debate about class in Britain, arguing that the demonization of the working class as chavs created a vacuum exploited by right-wing populists. The book demonstrated that the abandonment of class politics by Labour left working-class communities vulnerable to far-right recruitment, anticipating the UKIP surge and Brexit.'
WHERE title ILIKE '%Chavs%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Jones''s analysis of how neoliberalism deliberately destroyed working-class institutions and then blamed the resulting poverty on individual moral failure provides an essential framework for understanding class politics in the 21st century. His work challenges the left to recenter class alongside other axes of oppression and to rebuild solidarity with deindustrialized communities abandoned by centrist politics.'
WHERE title ILIKE '%Chavs%' AND progressive_analysis IS NULL;

-- Why Marx Was Right (Eagleton, 2011)
UPDATE books SET description = 'Published in 2011 by literary theorist and cultural critic Terry Eagleton, this accessible work takes on the ten most common objections to Marxism and systematically refutes each one. Eagleton addresses claims that Marxism leads to tyranny, reduces everything to economics, is historically deterministic, ignores human nature, and is irrelevant to post-industrial societies. He argues that Marx anticipated phenomena such as globalization, was skeptical of utopian blueprints, and that the fundamental dynamics of capitalism Marx analyzed remain operative despite changes in technology and social structure.'
WHERE title ILIKE '%Why Marx Was Right%' AND description IS NULL;

UPDATE books SET significance = 'Published in the aftermath of the 2008 financial crisis, when interest in Marx''s critique of capitalism was resurging, the book provided an accessible entry point for a new generation encountering Marxist ideas. Its witty prose style made complex theoretical arguments available to general readers, contributing to the post-crisis revival of Marxist thought.'
WHERE title ILIKE '%Why Marx Was Right%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Eagleton''s systematic demolition of anti-Marxist myths provides the contemporary left with ready responses to the most common dismissals of socialist thought. By demonstrating that Marx''s core insights about exploitation, crisis, and alienation remain relevant to 21st-century capitalism, the book helps reclaim Marxism as a living intellectual tradition rather than a historical curiosity.'
WHERE title ILIKE '%Why Marx Was Right%' AND progressive_analysis IS NULL;


-- ============================================================================
-- ANARCHIST CLASSICS
-- ============================================================================

-- The Conquest of Bread (Kropotkin, 1892)
UPDATE books SET description = 'Published in 1892 by Russian anarchist Peter Kropotkin, this work identifies the defects of feudalism and capitalism, arguing that these systems thrive on and maintain poverty and scarcity. Kropotkin proposes a decentralized economic system based on mutual aid and voluntary cooperation, asserting that every individual product is essentially the work of everyone since each person relies on the intellectual and physical labor of those who came before. He argues that the collective heritage of human knowledge and infrastructure means that no individual or class can rightfully claim exclusive ownership of the means of production.'
WHERE title ILIKE '%Conquest of Bread%' AND description IS NULL;

UPDATE books SET significance = 'The first completed and in-depth theoretical work of anarchist communism available to the public, its publication was a watershed moment in anarchist history that shifted the focus of the movement from individualist and mutualist strains toward social and communist tendencies. It influenced the Spanish Civil War anarchists, the Occupy movement, and continues to shape the Kurdish democratic confederalist revolution in Rojava.'
WHERE title ILIKE '%Conquest of Bread%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Kropotkin''s vision of a society organized around free association, mutual aid, and the collective ownership of the means of production provides a non-statist alternative to both capitalism and authoritarian socialism. His argument that abundance for all is achievable through cooperative organization challenges the capitalist myth of inevitable scarcity and remains central to anarchist-communist thought.'
WHERE title ILIKE '%Conquest of Bread%' AND progressive_analysis IS NULL;

-- Mutual Aid: A Factor of Evolution (Kropotkin, 1902)
UPDATE books SET description = 'Published in 1902 by Peter Kropotkin, this essay collection draws on observations from Siberia and extensive natural history to argue that cooperation, not competition, is the primary factor in the evolution of species. Kropotkin directly challenges Social Darwinism by demonstrating that mutual aid has pragmatic advantages for the survival of both animal and human communities and has been promoted through natural selection. He traces cooperation from insects and birds through medieval guilds and modern labor organizations, showing that the struggle against harsh environments favors cooperative behavior over individual competition.'
WHERE title ILIKE '%Mutual Aid%' AND description IS NULL;

UPDATE books SET significance = 'A fundamental text of anarchist communism that presented a scientific basis for cooperative social organization as an alternative to both Marxist historical materialism and laissez-faire Social Darwinism. Kropotkin''s seminal critique of competitive Social Darwinism helped revolutionize modern evolutionary theory, and many biologists consider it an important catalyst in the scientific study of cooperation.'
WHERE title ILIKE '%Mutual Aid%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Kropotkin''s scientific demonstration that cooperation is at least as important as competition in evolution undermines the ideological foundations of capitalist individualism and Social Darwinism. His work provides the left with a naturalistic argument that solidarity and mutual support are not naive ideals but deep-rooted tendencies in both animal and human societies, waiting to be organized at scale.'
WHERE title ILIKE '%Mutual Aid%' AND progressive_analysis IS NULL;

-- God and the State (Bakunin, 1882)
UPDATE books SET description = 'An unfinished manuscript by Russian anarchist philosopher Mikhail Bakunin, written in 1871 and published posthumously in 1882. The work presents a materialist critique of both religion and political authority, arguing that belief in God negates human liberty by subordinating reason to supernatural claims, while the state perpetuates oppression through its monopoly on force. Bakunin contends that the church and the state are illegitimate and interlinked institutions of control, with religion serving as the weapon of the state to enslave and impoverish humanity.'
WHERE title ILIKE '%God and the State%' AND description IS NULL;

UPDATE books SET significance = 'Widely translated and continuously in print since its publication, it remains one of the clearest and most passionate statements of anarchist philosophy. Peter Kropotkin viewed it as a cornerstone text exemplifying the philosophical foundations of anarchism, and it profoundly influenced subsequent anarchist thinkers including Kropotkin and Errico Malatesta.'
WHERE title ILIKE '%God and the State%' AND significance IS NULL;

UPDATE books SET progressive_analysis = 'Bakunin''s argument that religious and state authority are mutually reinforcing systems of domination provides the anarchist left with its foundational critique of all forms of hierarchical power. His insistence that genuine human freedom requires the abolition of both divine and temporal authority challenges authoritarian tendencies within the left itself, demanding that liberation movements practice the freedom they seek to create.'
WHERE title ILIKE '%God and the State%' AND progressive_analysis IS NULL;


-- ============================================================================
-- VERIFICATION QUERY (optional, run to check results)
-- ============================================================================
-- SELECT title,
--        CASE WHEN description IS NOT NULL THEN 'YES' ELSE 'NO' END as has_description,
--        CASE WHEN significance IS NOT NULL THEN 'YES' ELSE 'NO' END as has_significance,
--        CASE WHEN progressive_analysis IS NOT NULL THEN 'YES' ELSE 'NO' END as has_progressive_analysis
-- FROM books
-- WHERE title ILIKE ANY(ARRAY[
--     '%Communist Manifesto%', '%Kapital%', '%State and Revolution%',
--     '%What Is to Be Done%', '%Imperialism%Highest Stage%', '%Prison Notebooks%',
--     '%History and Class Consciousness%', '%Reform or Revolution%', '%Accumulation of Capital%',
--     '%Wretched of the Earth%', '%Black Skin%White Masks%', '%Orientalism%',
--     '%Discourse on Colonialism%', '%Europe Underdeveloped Africa%', '%Pedagogy of the Oppressed%',
--     '%Neocolonialism%Last Stage%', '%One-Dimensional Man%', '%Dialectic of Enlightenment%',
--     '%Minima Moralia%', '%Society of the Spectacle%', '%Capitalist Realism%',
--     '%Manufacturing Consent%', '%Second Sex%', '%Caliban and the Witch%',
--     '%Origin of the Family%', '%Gender Trouble%', '%People''s History of the United States%',
--     '%Shock Doctrine%', '%No Logo%', '%Debt%First 5%000 Years%',
--     '%Bullshit Jobs%', '%Open Veins of Latin America%', '%Chavs%',
--     '%Why Marx Was Right%', '%Conquest of Bread%', '%Mutual Aid%', '%God and the State%'
-- ])
-- ORDER BY title;
