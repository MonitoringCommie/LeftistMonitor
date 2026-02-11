-- Seed data for political ideologies
-- This file populates the ideologies table with comprehensive leftist and related ideologies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing data (if needed, uncomment the line below)
-- TRUNCATE TABLE ideologies CASCADE;

-- Insert ideologies
INSERT INTO ideologies (id, name, description, color, left_right_position, libertarian_authoritarian_position) VALUES

-- Classical Marxism variants
('550e8400-e29b-41d4-a716-446655440001', 'Marxism', 'The theoretical foundation of scientific socialism developed by Karl Marx and Friedrich Engels, emphasizing historical materialism, class struggle, and the dictatorship of the proletariat as a transitional stage toward communism.', '#ff0000', -95, -40),
('550e8400-e29b-41d4-a716-446655440002', 'Marxism-Leninism', 'The application of Marxist theory developed by Vladimir Lenin, emphasizing the role of a vanguard Communist Party in leading the proletarian revolution and building socialism in conditions of imperialism and capitalism.', '#cc0000', -98, -60),
('550e8400-e29b-41d4-a716-446655440003', 'Maoism', 'The adaptation of Marxist-Leninist theory by Mao Zedong emphasizing peasant revolution, protracted people''s war, continuous revolution, and cultural struggle as means to achieve communism, particularly applicable to agrarian societies.', '#b30000', -100, -70),
('550e8400-e29b-41d4-a716-446655440004', 'Trotskyism', 'An interpretation of Marxism developed by Leon Trotsky advocating for permanent revolution, continuous international revolution, and opposition to Stalin''s theory of building socialism in one country.', -97, -50),
('550e8400-e29b-41d4-a716-446655440005', 'Luxemburgism', 'The political thought of Rosa Luxemburg emphasizing the importance of spontaneous workers'' movements, internationalism, and democratic control alongside proletarian revolution.', '#ff1a1a', -94, -30),
('550e8400-e29b-41d4-a716-446655440006', 'Council Communism', 'A left communist current emphasizing workers'' councils as the basis for proletarian power and organization, opposed to both capitalism and Leninist vanguardism.', '#ff3333', -92, -25),
('550e8400-e29b-41d4-a716-446655440007', 'Autonomism', 'An Italian left-communist current emphasizing autonomous workers'' movements independent of traditional party structures and labor unions, focusing on self-managed territories and communities.', '#ff4444', -88, -20),
('550e8400-e29b-41d4-a716-446655440008', 'Titoism', 'The system of socialism developed in Yugoslavia under Josip Broz Tito, emphasizing worker self-management, market socialism, and independence from Soviet control.', -85, -35),

-- Anarchist variants
('550e8400-e29b-41d4-a716-446655440009', 'Anarcho-Communism', 'An anarchist ideology advocating for a stateless, classless society with common ownership of production means and distribution according to need, achieved through direct action and voluntary association.', '#000000', -99, 85),
('550e8400-e29b-41d4-a716-446655440010', 'Anarcho-Syndicalism', 'An anarchist approach to labor organizing emphasizing revolutionary trade unions as the means to overthrow capitalism and establish a federal, decentralized society based on workplace democracy.', '#2a2a2a', -92, 75),
('550e8400-e29b-41d4-a716-446655440011', 'Mutualism', 'An anarchist ideology developed by Pierre-Joseph Proudhon advocating for a market society based on cooperation, mutual aid, and voluntary association without state or capitalist exploitation.', '#404040', -75, 70),
('550e8400-e29b-41d4-a716-446655440012', 'Collectivist Anarchism', 'An anarchist current emphasizing collective ownership of production means, group decision-making, and distribution based on contribution, without state authority or hierarchy.', '#1a1a1a', -95, 80),
('550e8400-e29b-41d4-a716-446655440013', 'Platformism', 'An anarchist organizational theory emphasizing the need for structured, explicitly anarchist organizations with clear ideological positions, strategic direction, and accountability among members.', '#333333', -93, 60),

-- Democratic and reform-oriented socialism
('550e8400-e29b-41d4-a716-446655440014', 'Democratic Socialism', 'A political and economic ideology combining a commitment to democratic political processes with economic socialism, emphasizing democratic control of the economy and state without authoritarian centralism.', '#ff6666', -80, -10),
('550e8400-e29b-41d4-a716-446655440015', 'Social Democracy', 'A political ideology that emerged from Marxist socialist movements, advocating for reformist socialism achieved through democratic processes, universal suffrage, and the welfare state.', '#ff9999', -65, -15),
('550e8400-e29b-41d4-a716-446655440016', 'Eurocommunism', 'A version of communism developed in Western Europe in the 1970s-80s, emphasizing democratic pluralism, national autonomy, and parliamentary paths to socialism rather than Soviet-style vanguardism.', '#ff5555', -78, -20),
('550e8400-e29b-41d4-a716-446655440017', 'Reformism', 'A political approach advocating for gradual reform of capitalism toward socialism through democratic institutions rather than revolution, often associated with labor movements and social democracy.', '#ffcccc', -55, -15),

-- Specialized leftist ideologies
('550e8400-e29b-41d4-a716-446655440018', 'Eco-Socialism', 'A political ideology combining socialism with ecological concerns, advocating for an economic system based on ecological sustainability, workers'' control, and meeting human needs without environmental destruction.', '#228b22', -85, -30),
('550e8400-e29b-41d4-a716-446655440019', 'Feminist Socialism', 'A current within socialism emphasizing the intersection of gender oppression and class exploitation, advocating for the liberation of women as integral to socialist revolution and construction.', '#ff1493', -88, -35),
('550e8400-e29b-41d4-a716-446655440020', 'Liberation Theology', 'A Christian theological and political movement originating in Latin America, emphasizing the liberation of the poor from social injustice and poverty through faith-based activism and class struggle.', '#8b0000', -82, -25),
('550e8400-e29b-41d4-a716-446655440021', 'Anarcho-Feminism', 'An anarchist tendency emphasizing the interconnection between patriarchy and hierarchy, advocating for feminist liberation through anarchist means and anti-authoritarian organization.', '#800080', -96, 80),
('550e8400-e29b-41d4-a716-446655440022', 'Queer Anarchism', 'An anarchist current addressing the liberation of LGBTQ+ people, opposing all forms of hierarchy and domination including heteronormativity, sexism, and gender essentialism.', '#ff00ff', -95, 85),

-- Third World and Anti-Imperialist movements
('550e8400-e29b-41d4-a716-446655440023', 'Third-Worldism', 'A revolutionary anti-imperialist ideology emphasizing the role of colonized and semi-colonized nations in the struggle against imperialism and capitalism, often associated with national liberation movements.', '#ff6b35', -82, -45),
('550e8400-e29b-41d4-a716-446655440024', 'Pan-Africanism', 'A political and cultural ideology emphasizing the unity and independence of African peoples and nations, opposing colonialism and imperialism, with many variants combining it with socialism.', '#009639', -75, -35),
('550e8400-e29b-41d4-a716-446655440025', 'Pan-Arabism', 'A nationalist ideology emphasizing Arab cultural and political unity, particularly in opposition to imperialism and colonialism, with many socialist and leftist variants.', '#ffffff', -65, -40),
('550e8400-e29b-41d4-a716-446655440026', 'Bolivarianism', 'A Latin American leftist ideology emphasizing national independence, regional integration, anti-imperialism, and social justice, inspired by Simón Bolívar and developed particularly under Hugo Chávez.', '#ffcc00', -75, -45),
('550e8400-e29b-41d4-a716-446655440027', 'Afrocentrism', 'An ideological and cultural movement centering African and African diaspora experiences, knowledge systems, and perspectives, often combined with anti-racist and leftist politics.', '#000000', -60, -20),

-- Asian socialist models
('550e8400-e29b-41d4-a716-446655440028', 'Juche', 'The ideology of self-reliance and national independence developed by North Korea under Kim Il-sung, emphasizing independence from imperialism and great power control, combined with Marxist-Leninist and nationalist elements.', '#c60c30', -75, -85),
('550e8400-e29b-41d4-a716-446655440029', 'Ho Chi Minh Thought', 'The revolutionary political philosophy of Ho Chi Minh, combining Marxism-Leninism with Vietnamese nationalism, emphasizing anti-imperialism, national liberation, and the peasantry as a revolutionary force.', '#ffcc00', -88, -55),
('550e8400-e29b-41d4-a716-446655440030', 'Hoxhaism', 'A Marxist-Leninist current based on Enver Hoxha''s interpretation of Marxism, opposing both Western capitalism and Soviet-style social imperialism, emphasizing socialist self-reliance and proletarian internationalism.', '#ff0000', -96, -65),

-- Liberation movements and armed struggle variants
('550e8400-e29b-41d4-a716-446655440031', 'Guevarism', 'The revolutionary theory and practice developed by Ernesto "Che" Guevara, emphasizing guerrilla warfare, continental revolution, the role of radical intellectuals, and internationalist commitment to liberation struggles.', '#ff4500', -85, -50),
('550e8400-e29b-41d4-a716-446655440032', 'Zapatismo', 'The revolutionary movement and indigenous-centered political ideology from the Zapatista Army of National Liberation in Mexico, emphasizing indigenous rights, autonomy, anti-capitalism, and direct democracy.', '#ff0000', -88, 30),
('550e8400-e29b-41d4-a716-446655440033', 'Palestinian Liberation Ideology', 'The political and ideological framework of Palestinian national liberation movements, emphasizing return of refugees, self-determination, and independence, with various socialist and leftist currents.', '#007a5e', -78, -40),

-- Libertarian and decentralist leftism
('550e8400-e29b-41d4-a716-446655440034', 'Libertarian Socialism', 'A socialist current emphasizing individual freedom, voluntary association, and decentralized decision-making combined with economic socialism and opposition to both capitalism and state socialism.', '#ff0000', -85, 50),
('550e8400-e29b-41d4-a716-446655440035', 'Market Socialism', 'A form of socialism using market mechanisms for allocation while maintaining collective or state ownership of production means, attempting to combine efficiency with socialist principles.', '#ff6666', -70, -25),
('550e8400-e29b-41d4-a716-446655440036', 'Participatory Economics', 'An economic model and political ideology emphasizing democratic participation in economic decisions through councils and assemblies, replacing both capitalist markets and central planning.', '#ff3333', -80, 40),

-- Regional and contextual left variants
('550e8400-e29b-41d4-a716-446655440037', 'Kurdish Democratic Confederalism', 'The political ideology developed by Kurdistan Workers'' Party (PKK), emphasizing confederal democratic organization, women''s liberation, ecological sustainability, and multi-ethnic coexistence without a state.', '#ffcc00', -80, 60),
('550e8400-e29b-41d4-a716-446655440038', 'Naxalism', 'A revolutionary communist movement in South Asia emphasizing peasant revolution, agrarian reform, armed struggle against imperialism and feudalism, and Maoist principles applied to the Indian context.', '#ff0000', -95, -55),
('550e8400-e29b-41d4-a716-446655440039', 'Communalism', 'A leftist political ideology emphasizing the importance of community, collective decision-making, shared resources, and anti-hierarchical organization in building socialism.', '#ff3333', -85, 50),

-- Post-Soviet and contemporary left variants
('550e8400-e29b-41d4-a716-446655440040', 'Autonomist Marxism', 'An Italian Marxist current emphasizing autonomous workers'' movements, rejecting party mediation, and focusing on social reproduction, precarity, and diffuse self-organization outside traditional labor unions.', '#ff4444', -88, 30),
('550e8400-e29b-41d4-a716-446655440041', 'Post-Left Anarchism', 'A contemporary anarchist current questioning anarchist orthodoxy and grand narratives, emphasizing informal organization, local action, and criticism of both capitalism and traditional leftist frameworks.', '#000000', -80, 75),
('550e8400-e29b-41d4-a716-446655440042', 'Accelerationism', 'A speculative left ideology advocating for accelerating capitalist technological development to transcend capitalism or reach post-capitalist conditions, with significant internal debate about its implications.', '#1a1a1a', -70, -35),

-- Indigenous and decolonial perspectives
('550e8400-e29b-41d4-a716-446655440043', 'Indigenous Socialism', 'A political framework combining indigenous peoples'' rights, sovereignty, and knowledge systems with socialist principles, emphasizing self-determination and decolonization.', '#00a651', -82, 40),
('550e8400-e29b-41d4-a716-446655440044', 'Decolonial Socialism', 'A theoretical and political current combining decolonial theory (the undoing of modernity/coloniality) with socialism, challenging Western Marxist frameworks through non-Western epistemologies.', '#ff6b35', -85, 35),

-- Additional important left variants
('550e8400-e29b-41d4-a716-446655440045', 'Left Communism', 'A Marxist current critical of both capitalism and state socialism, emphasizing workers'' spontaneity, council communism, and rejection of the party-form and trade union mediation.', '#8b0000', -94, 30),
('550e8400-e29b-41d4-a716-446655440046', 'Autonomism', 'An Italian leftist current emphasizing autonomous self-organization, direct action, and critique of mediation by parties and unions, focusing on everyday life and social relations.', '#ff4444', -87, 45),
('550e8400-e29b-41d4-a716-446655440047', 'Syndicalism', 'A political ideology emphasizing revolutionary trade unions and direct action through labor unions as the primary means of social change and organization of society.', '#cc0000', -82, -20),
('550e8400-e29b-41d4-a716-446655440048', 'Anarchist Communism', 'A form of anarchism advocating for a society of common ownership, non-hierarchical organization, and distribution according to need, achieved through direct action and mutual aid.', '#000000', -99, 85),
('550e8400-e29b-41d4-a716-446655440049', 'Vegetarianism/Veganism as Leftism', 'A political stance combining animal liberation and anti-speciesism with socialist or anarchist principles, viewing veganism as part of ethical liberation and environmental sustainability.', '#00aa00', -78, 50),
('550e8400-e29b-41d4-a716-446655440050', 'Anarcha-Feminism (combined entry)', 'The combined ideology of anarchism and feminism, viewing the struggle against patriarchy as inseparable from the struggle against all forms of hierarchy and domination.', '#ff00ff', -97, 85);

-- Verify inserts
SELECT COUNT(*) as ideology_count FROM ideologies;
