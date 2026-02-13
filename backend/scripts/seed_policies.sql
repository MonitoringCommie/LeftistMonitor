-- Seed data for policies table
-- Historically significant progressive policies and laws from around the world

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert policies
INSERT INTO policies (
  id, title, title_original, summary, description, country_id, policy_type, status,
  date_proposed, date_passed, date_enacted, date_repealed,
  progressive_score, progressive_analysis, wikidata_id, official_url
) VALUES

-- =============================================================================
-- UNITED STATES
-- =============================================================================

(
  gen_random_uuid(),
  'Social Security Act',
  NULL,
  'Created the US social safety net including old-age pensions, unemployment insurance, and aid to dependent children.',
  'Signed by Franklin Roosevelt as part of the New Deal, the Social Security Act established a system of old-age benefits for workers, unemployment insurance, and aid for dependent mothers and children. It was the first major federal welfare program in US history and remains the backbone of retirement security for most Americans.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'social_welfare',
  'amended',
  NULL,
  '1935-08-14',
  '1935-08-14',
  NULL,
  9.0,
  'Established the foundation of the American welfare state. Landmark shift from purely individualist approach to collective social insurance.',
  'Q331461',
  'https://www.ssa.gov/history/35act.html'
),

(
  gen_random_uuid(),
  'National Labor Relations Act (Wagner Act)',
  NULL,
  'Guaranteed workers the right to organize unions and bargain collectively.',
  'The Wagner Act gave workers the legal right to form and join unions, to bargain collectively through representatives of their choosing, and to strike. It created the National Labor Relations Board to enforce these rights and defined unfair labor practices by employers. It was the most pro-labor legislation in US history.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'labor',
  'amended',
  NULL,
  '1935-07-05',
  '1935-07-05',
  NULL,
  9.5,
  'Fundamentally changed the balance of power between labor and capital in the US. Union membership surged in the following decades.',
  'Q1139498',
  NULL
),

(
  gen_random_uuid(),
  'Fair Labor Standards Act',
  NULL,
  'Established the federal minimum wage, overtime pay, and banned most child labor.',
  'Set the first federal minimum wage at 25 cents per hour, established the 40-hour work week with overtime pay requirements, and prohibited oppressive child labor. Covered roughly 20% of the workforce initially. Has been amended many times to raise the wage floor and expand coverage.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'labor',
  'amended',
  NULL,
  '1938-06-25',
  '1938-10-24',
  NULL,
  8.5,
  'Set baseline labor protections that previous generations of workers had fought and died for. The minimum wage has not kept pace with productivity since the 1960s.',
  'Q1064526',
  NULL
),

(
  gen_random_uuid(),
  'GI Bill (Servicemen''s Readjustment Act)',
  NULL,
  'Provided education, housing, and unemployment benefits to returning WWII veterans.',
  'Gave returning veterans access to college tuition, low-cost mortgages, and unemployment compensation. Roughly 8 million veterans used the education benefits. It massively expanded the American middle class, though Black veterans were systematically excluded from many of its benefits due to racist administration at the local level.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'social_welfare',
  'amended',
  NULL,
  '1944-06-22',
  '1944-06-22',
  NULL,
  7.5,
  'Created the modern American middle class but was administered in a racially discriminatory way. A case study in how universal programs can still produce unequal outcomes.',
  'Q1471634',
  NULL
),

(
  gen_random_uuid(),
  'Civil Rights Act of 1964',
  NULL,
  'Outlawed discrimination based on race, color, religion, sex, or national origin.',
  'Banned racial segregation in schools, workplaces, and public accommodations. Title VII prohibited employment discrimination. Created the Equal Employment Opportunity Commission. Passed after years of civil rights organizing, sit-ins, marches, and the assassination of President Kennedy. Southern Democrats filibustered for 54 days before cloture was invoked.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'civil_rights',
  'enacted',
  '1963-06-19',
  '1964-07-02',
  '1964-07-02',
  NULL,
  9.5,
  'Dismantled the legal framework of Jim Crow segregation. One of the most consequential pieces of legislation in American history.',
  'Q580904',
  NULL
),

(
  gen_random_uuid(),
  'Voting Rights Act of 1965',
  NULL,
  'Prohibited racial discrimination in voting and eliminated barriers like literacy tests.',
  'Outlawed discriminatory voting practices such as literacy tests and poll taxes that had been used to disenfranchise Black voters, especially in the South. Section 5 required jurisdictions with a history of discrimination to get federal approval before changing voting rules. The Supreme Court gutted this provision in Shelby County v. Holder (2013).',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'civil_rights',
  'amended',
  NULL,
  '1965-08-06',
  '1965-08-06',
  NULL,
  9.5,
  'Directly enfranchised millions of Black voters. Black voter registration in Mississippi went from 6.7% to 59.8% within a few years of passage.',
  'Q767807',
  NULL
),

(
  gen_random_uuid(),
  'Medicare and Medicaid Act',
  NULL,
  'Created public health insurance for the elderly (Medicare) and the poor (Medicaid).',
  'Title XVIII of the Social Security Amendments established Medicare, providing hospital and medical insurance for Americans 65 and older. Title XIX established Medicaid, a joint federal-state program providing health coverage for low-income people. Together they represented the largest expansion of public health coverage in US history until the ACA.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'healthcare',
  'amended',
  NULL,
  '1965-07-30',
  '1965-07-30',
  NULL,
  9.0,
  'Brought the US partially into line with other developed nations on public health coverage. Medicare remains the most popular government program in the country.',
  'Q1138861',
  NULL
),

(
  gen_random_uuid(),
  'Affordable Care Act (Obamacare)',
  NULL,
  'Expanded health insurance coverage through exchanges, Medicaid expansion, and insurance market reforms.',
  'Required most Americans to have health insurance, created marketplace exchanges for purchasing coverage, expanded Medicaid eligibility, banned denial of coverage for pre-existing conditions, and allowed children to stay on parents'' insurance until age 26. Reduced the uninsured rate from about 16% to under 9%.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'healthcare',
  'amended',
  NULL,
  '2010-03-23',
  '2010-03-23',
  NULL,
  7.0,
  'Significant expansion of health coverage but preserved the private insurance system. A compromise approach compared to single-payer proposals.',
  'Q471871',
  'https://www.healthcare.gov/'
),

(
  gen_random_uuid(),
  'Clean Air Act of 1970',
  NULL,
  'Established federal authority to regulate air pollution and set air quality standards.',
  'Authorized the EPA to set National Ambient Air Quality Standards, required states to develop implementation plans, and set emission standards for new pollution sources. Later amendments in 1990 addressed acid rain, ozone depletion, and toxic air pollutants. Passed with overwhelming bipartisan support.',
  '65fbee2a-7c0f-4c51-99c9-966a056850cb',
  'environmental',
  'amended',
  NULL,
  '1970-12-31',
  '1970-12-31',
  NULL,
  8.0,
  'Has prevented an estimated hundreds of thousands of premature deaths. The cost-benefit ratio is strongly positive: the EPA estimates $30 in benefits for every $1 in costs.',
  'Q899297',
  NULL
),

-- =============================================================================
-- UNITED KINGDOM
-- =============================================================================

(
  gen_random_uuid(),
  'National Health Service Act 1946',
  NULL,
  'Created the British National Health Service, providing free healthcare to all residents.',
  'Implemented the vision of the Beveridge Report by nationalizing hospitals and creating a comprehensive health service funded through taxation and free at the point of use. Health Minister Aneurin Bevan drove it through despite fierce opposition from the British Medical Association. The NHS opened on July 5, 1948.',
  '99077e19-041b-4cba-ac10-b33af0100071',
  'healthcare',
  'amended',
  NULL,
  '1946-11-06',
  '1948-07-05',
  NULL,
  10.0,
  'The single most important piece of social legislation in British history. Established the principle that healthcare is a right, not a commodity. Remains hugely popular across the political spectrum.',
  'Q854851',
  NULL
),

(
  gen_random_uuid(),
  'Factory Act 1833',
  NULL,
  'First effective regulation of factory working conditions, particularly for children.',
  'Prohibited employment of children under 9 in textile factories, limited working hours for children aged 9-13 to 8 hours per day, and those 13-18 to 12 hours. Crucially, it created government factory inspectors with enforcement powers. Previous factory acts had been unenforceable without inspectors.',
  '99077e19-041b-4cba-ac10-b33af0100071',
  'labor',
  'enacted',
  NULL,
  '1833-08-29',
  '1833-08-29',
  NULL,
  7.5,
  'One of the earliest effective pieces of labor regulation. Established the principle that the state can and should regulate working conditions.',
  'Q1393809',
  NULL
),

(
  gen_random_uuid(),
  'Education Act 1944 (Butler Act)',
  NULL,
  'Established free secondary education for all children in England and Wales.',
  'Made secondary education free and compulsory for all children up to age 15. Created a tripartite system of grammar schools, technical schools, and secondary modern schools. Also provided free milk, meals, and medical inspections for school children. Represented a massive expansion of educational access for working-class children.',
  '99077e19-041b-4cba-ac10-b33af0100071',
  'education',
  'amended',
  NULL,
  '1944-08-03',
  '1944-08-03',
  NULL,
  8.5,
  'Opened up secondary education to the entire population. Part of the wartime consensus that postwar Britain should be more equal.',
  'Q612464',
  NULL
),

(
  gen_random_uuid(),
  'National Insurance Act 1946',
  NULL,
  'Established comprehensive social insurance covering unemployment, sickness, maternity, and retirement.',
  'Implemented the Beveridge Report recommendations for a cradle-to-grave welfare state. Required contributions from workers, employers, and the government in exchange for benefits covering unemployment, sickness, maternity, widowhood, and retirement. Replaced the patchwork of earlier insurance schemes with a universal system.',
  '99077e19-041b-4cba-ac10-b33af0100071',
  'social_welfare',
  'amended',
  NULL,
  '1946-08-01',
  '1948-07-05',
  NULL,
  9.0,
  'The foundation of the modern British welfare state. Established the principle of universal social insurance as a right of citizenship.',
  'Q6973604',
  NULL
),

-- =============================================================================
-- FRANCE
-- =============================================================================

(
  gen_random_uuid(),
  'Aubry Law (35-Hour Work Week)',
  'Loi Aubry',
  'Reduced the standard work week from 39 hours to 35 hours.',
  'Passed in two phases (1998 and 2000) under Prime Minister Lionel Jospin. Reduced the statutory working week from 39 to 35 hours for all employees in companies with more than 20 workers. Aimed to reduce unemployment by distributing work more broadly and to improve quality of life. Overtime above 35 hours must be compensated at a higher rate.',
  'bf3ea203-3dc1-49f0-8e9f-434e752bf447',
  'labor',
  'amended',
  NULL,
  '1998-06-13',
  '2000-01-19',
  NULL,
  8.5,
  'One of the most ambitious working-time reduction policies in the developed world. Reduced average working hours but has been weakened by subsequent governments.',
  'Q3006973',
  NULL
),

(
  gen_random_uuid(),
  'Universal Health Coverage (Couverture Maladie Universelle)',
  'Couverture Maladie Universelle',
  'Extended health insurance coverage to all legal residents of France regardless of employment status.',
  'Before 1999, health coverage in France was tied to employment. The CMU gave automatic health coverage to all legal residents, and provided free supplementary coverage for those below an income threshold. France''s health system is consistently rated among the best in the world.',
  'bf3ea203-3dc1-49f0-8e9f-434e752bf447',
  'healthcare',
  'amended',
  NULL,
  '1999-07-27',
  '2000-01-01',
  NULL,
  9.0,
  'Closed the last remaining gaps in French health coverage. Made healthcare access truly universal rather than employment-dependent.',
  'Q3007116',
  NULL
),

(
  gen_random_uuid(),
  'Matignon Agreements',
  'Accords de Matignon',
  'Granted workers paid holidays, the 40-hour work week, and collective bargaining rights after the 1936 general strike.',
  'Negotiated between employers, unions, and the Popular Front government of Leon Blum during the massive sit-down strike wave of June 1936. Workers won a 40-hour work week, two weeks of paid vacation (conges payes), wage increases of 7-15%, and recognition of collective bargaining rights. The paid vacation was a world first at this scale.',
  'bf3ea203-3dc1-49f0-8e9f-434e752bf447',
  'labor',
  'enacted',
  NULL,
  '1936-06-07',
  '1936-06-07',
  NULL,
  9.0,
  'Won through the largest strike wave in French history. The paid vacation provision was transformative for working-class life.',
  'Q1325741',
  NULL
),

-- =============================================================================
-- GERMANY
-- =============================================================================

(
  gen_random_uuid(),
  'Health Insurance Act (Bismarck''s Social Insurance)',
  'Gesetz betreffend die Krankenversicherung der Arbeiter',
  'Created the world''s first national health insurance system for workers.',
  'Chancellor Otto von Bismarck introduced compulsory health insurance for industrial workers in 1883, followed by accident insurance (1884) and old-age pensions (1889). The health insurance act required employers and workers to contribute to sickness funds. Bismarck''s goal was to undercut the appeal of the Social Democrats, but the programs became permanent fixtures.',
  '1e81d981-6328-48fa-a526-4232e132abc9',
  'healthcare',
  'amended',
  NULL,
  '1883-06-15',
  '1883-06-15',
  NULL,
  8.0,
  'The first national social insurance system in the world. Became the model for welfare states globally, even though Bismarck''s motives were anti-socialist.',
  'Q700583',
  NULL
),

(
  gen_random_uuid(),
  'Co-Determination Act',
  'Mitbestimmungsgesetz',
  'Required large companies to give workers representation on supervisory boards.',
  'The 1976 law requires companies with more than 2,000 employees to have worker representatives fill half the seats on the supervisory board (Aufsichtsrat). An earlier 1951 law had established full parity co-determination in the coal and steel industries. Workers don''t run the companies, but they have a real voice in major decisions like plant closures and layoffs.',
  '1e81d981-6328-48fa-a526-4232e132abc9',
  'labor',
  'enacted',
  NULL,
  '1976-05-04',
  '1976-05-04',
  NULL,
  8.5,
  'Gives German workers more institutional power than workers in most other capitalist countries. Often cited as a reason for Germany''s relatively cooperative labor relations.',
  'Q700474',
  NULL
),

(
  gen_random_uuid(),
  'Works Constitution Act',
  'Betriebsverfassungsgesetz',
  'Established works councils in all workplaces with 5 or more employees.',
  'Requires the creation of elected works councils (Betriebsrate) in establishments with at least 5 employees. Works councils have co-determination rights on social matters (working hours, pay methods, health and safety), consultation rights on staffing, and information rights on economic matters. They are separate from trade unions.',
  '1e81d981-6328-48fa-a526-4232e132abc9',
  'labor',
  'amended',
  NULL,
  '1972-01-15',
  '1972-01-15',
  NULL,
  8.0,
  'Creates a layer of workplace democracy that has no equivalent in most countries. Works councils are now present in about 40% of eligible German workplaces.',
  'Q700471',
  NULL
),

-- =============================================================================
-- BRAZIL
-- =============================================================================

(
  gen_random_uuid(),
  'Bolsa Familia',
  'Bolsa Familia',
  'Conditional cash transfer program providing payments to poor families who keep children in school and get vaccinated.',
  'Launched under President Lula da Silva, Bolsa Familia consolidated several earlier transfer programs. Families below a certain income threshold receive monthly payments conditional on children attending school and getting vaccinations. At its peak it reached about 14 million families (roughly 50 million people). It cost about 0.5% of GDP.',
  '0cc096d7-6606-43c4-a0e6-6040cc72999b',
  'social_welfare',
  'amended',
  NULL,
  '2003-10-20',
  '2003-10-20',
  NULL,
  8.5,
  'Helped lift roughly 20 million Brazilians out of extreme poverty. Became a model for conditional cash transfer programs worldwide. Remarkably cost-effective.',
  'Q798498',
  NULL
),

(
  gen_random_uuid(),
  'Consolidation of Labor Laws',
  'Consolidacao das Leis do Trabalho',
  'Comprehensive labor code establishing workers'' rights including minimum wage, 8-hour day, and paid vacation.',
  'Enacted under Getulio Vargas, the CLT consolidated decades of labor legislation into a single code. It established the 8-hour workday, minimum wage, paid annual vacation, maternity leave, overtime pay, and workplace safety standards. Also regulated trade unions, though in a corporatist framework that gave the state significant control over organized labor.',
  '0cc096d7-6606-43c4-a0e6-6040cc72999b',
  'labor',
  'amended',
  NULL,
  '1943-05-01',
  '1943-05-01',
  NULL,
  7.5,
  'Gave Brazilian workers significant legal protections but within a corporatist framework that limited union independence. Still the foundation of Brazilian labor law.',
  'Q10262485',
  NULL
),

-- =============================================================================
-- SOUTH AFRICA
-- =============================================================================

(
  gen_random_uuid(),
  'Constitution of South Africa',
  NULL,
  'Post-apartheid constitution with one of the world''s most expansive bills of rights.',
  'Adopted after the end of apartheid, the South African constitution includes rights to housing, healthcare, food, water, social security, and education. It was the first constitution in the world to prohibit discrimination based on sexual orientation. The Constitutional Court has used these provisions to order the government to provide antiretroviral drugs and expand housing.',
  '58de7d54-f851-45a7-b193-52ad05b6d209',
  'constitutional',
  'enacted',
  NULL,
  '1996-12-10',
  '1997-02-04',
  NULL,
  9.5,
  'Widely considered one of the most progressive constitutions in the world. Includes socio-economic rights that most constitutions omit. Implementation has been uneven.',
  'Q845585',
  NULL
),

(
  gen_random_uuid(),
  'Black Economic Empowerment Act',
  NULL,
  'Framework to address economic inequality left by apartheid through ownership, management, and skills development targets.',
  'Created a scorecard system requiring companies to meet targets for Black ownership, management representation, skills development, enterprise development, and preferential procurement. Aimed to transfer economic power to the Black majority after centuries of exclusion. Companies are rated on a BEE scorecard that affects their ability to win government contracts.',
  '58de7d54-f851-45a7-b193-52ad05b6d209',
  'economic',
  'amended',
  NULL,
  '2003-01-09',
  '2004-01-09',
  NULL,
  7.5,
  'An attempt to address structural economic inequality without wholesale redistribution. Critics say it has primarily benefited a small Black elite rather than the broader population.',
  'Q4920543',
  NULL
),

-- =============================================================================
-- INDIA
-- =============================================================================

(
  gen_random_uuid(),
  'National Rural Employment Guarantee Act (NREGA)',
  'Mahatma Gandhi National Rural Employment Guarantee Act',
  'Guarantees 100 days of paid employment per year to every rural household willing to do unskilled manual work.',
  'The world''s largest public works program. Any rural household can demand work and the government is legally obligated to provide it within 15 days or pay an unemployment allowance. Workers build roads, dig wells, construct irrigation systems, and do other infrastructure work. Covers roughly 50 million households annually.',
  'b37cecc7-a5d4-4f4b-be67-76d09556f008',
  'social_welfare',
  'enacted',
  NULL,
  '2005-08-23',
  '2006-02-02',
  NULL,
  9.0,
  'A legally enforceable right to work -- one of the few such programs in the world. Has reduced rural poverty and distress migration. Implementation quality varies enormously by state.',
  'Q1973498',
  NULL
),

(
  gen_random_uuid(),
  'Right to Education Act',
  NULL,
  'Made free and compulsory education a fundamental right for all children aged 6-14.',
  'Made education a justiciable fundamental right under Article 21A of the Indian Constitution. Requires all private schools to reserve 25% of seats for children from disadvantaged backgrounds. Sets standards for pupil-teacher ratios, school infrastructure, and teacher qualifications. Prohibits physical punishment and mental harassment of children.',
  'b37cecc7-a5d4-4f4b-be67-76d09556f008',
  'education',
  'enacted',
  NULL,
  '2009-08-26',
  '2010-04-01',
  NULL,
  8.5,
  'Brought India in line with most of the world in recognizing education as a fundamental right. Enrollment rates increased significantly, though learning outcomes remain a challenge.',
  'Q3501795',
  NULL
),

(
  gen_random_uuid(),
  'Reservation System (Constitutional Provisions)',
  NULL,
  'Affirmative action system reserving seats in education and government jobs for historically oppressed castes and tribes.',
  'Articles 15 and 16 of the Indian Constitution (1950) provided for reservations for Scheduled Castes, Scheduled Tribes, and later Other Backward Classes. Currently reserves roughly 50% of seats in central government institutions. The Mandal Commission (1980) recommended extending reservations to OBCs, which was implemented in 1990 amid massive protests.',
  'b37cecc7-a5d4-4f4b-be67-76d09556f008',
  'civil_rights',
  'amended',
  '1950-01-26',
  '1950-01-26',
  '1950-01-26',
  NULL,
  8.0,
  'The world''s oldest and largest affirmative action program. Has significantly increased representation of lower castes in education and government, though economic inequality persists.',
  'Q2634265',
  NULL
),

-- =============================================================================
-- CHINA
-- =============================================================================

(
  gen_random_uuid(),
  'Chinese Land Reform Law',
  NULL,
  'Redistributed land from landlords to peasants, eliminating the feudal land ownership system.',
  'The Agrarian Reform Law of 1950 confiscated land from landlords and redistributed it to roughly 300 million landless peasants. Land reform had already been carried out in Communist-controlled areas during the civil war. The process was often violent, with estimates of 1-2 million landlords killed during struggle sessions. It fundamentally reshaped rural Chinese society.',
  '4a88499d-85a9-4141-a787-d933602a69fb',
  'economic',
  'enacted',
  NULL,
  '1950-06-30',
  '1950-06-30',
  NULL,
  7.0,
  'One of the largest land redistributions in history. Eliminated the landlord class and gave peasants land for the first time, but the process was extremely brutal.',
  'Q7206889',
  NULL
),

(
  gen_random_uuid(),
  'Labor Contract Law',
  NULL,
  'Strengthened worker protections by requiring written contracts, limiting temporary work, and regulating dismissals.',
  'Required employers to give written contracts to all workers, limited the use of temporary and dispatch workers, required severance pay for terminated employees, and gave open-ended contracts to workers who had served 10 or more years. Passed in response to widespread labor abuses including wage theft and unsafe conditions.',
  '4a88499d-85a9-4141-a787-d933602a69fb',
  'labor',
  'enacted',
  NULL,
  '2007-06-29',
  '2008-01-01',
  NULL,
  6.5,
  'Significant on paper but enforcement is inconsistent. Has somewhat improved formal labor protections in a country where independent unions are banned.',
  'Q6974011',
  NULL
),

-- =============================================================================
-- ARGENTINA
-- =============================================================================

(
  gen_random_uuid(),
  'Workers'' Rights and Social Justice Reforms (Peronist Labor Laws)',
  NULL,
  'Comprehensive package of labor and social welfare reforms under Juan Peron including paid vacation, pensions, and union rights.',
  'Under Peron (1946-1955), Argentina passed a sweeping set of labor reforms: mandatory paid vacations, the aguinaldo (13th month salary), pension expansion, workplace safety regulations, union recognition, and collective bargaining rights. Also included the Declaration of the Rights of the Worker in 1947. These reforms made Argentina''s labor protections among the strongest in Latin America.',
  '645c0438-8d70-4668-aac8-8c3ff4cae9f3',
  'labor',
  'amended',
  NULL,
  '1947-02-24',
  '1947-02-24',
  NULL,
  8.0,
  'Transformed Argentine labor relations and created a strong union movement. The 13th month salary (aguinaldo) has been adopted across Latin America.',
  NULL,
  NULL
),

(
  gen_random_uuid(),
  'Universal Child Allowance',
  'Asignacion Universal por Hijo',
  'Monthly cash payment to unemployed or informal-sector parents for each child under 18.',
  'Launched under President Cristina Fernandez de Kirchner, the AUH provides a monthly payment per child (up to 5 children) to parents who are unemployed, work in the informal economy, or earn below the minimum wage. Conditional on school attendance and vaccination. Covers roughly 4 million children.',
  '645c0438-8d70-4668-aac8-8c3ff4cae9f3',
  'social_welfare',
  'enacted',
  NULL,
  '2009-10-29',
  '2009-10-29',
  NULL,
  8.5,
  'Reached a large segment of children previously excluded from the social protection system. Reduced child poverty and increased school enrollment.',
  'Q5694757',
  NULL
),

-- =============================================================================
-- BOLIVIA
-- =============================================================================

(
  gen_random_uuid(),
  'Nationalization of Hydrocarbons',
  'Decreto Supremo 28701',
  'Nationalized Bolivia''s natural gas reserves, requiring foreign companies to renegotiate contracts giving the state majority control.',
  'President Evo Morales issued Supreme Decree 28701 on May 1, 2006, sending the military to occupy gas fields. Required foreign companies to hand over majority control and renegotiate contracts within 180 days, giving the state company YPFB at least 51% ownership. Government revenue from hydrocarbons increased dramatically, funding social programs.',
  '4b82a2c2-cd2e-432f-bcd9-c0285e8018ba',
  'economic',
  'enacted',
  NULL,
  '2006-05-01',
  '2006-05-01',
  NULL,
  8.0,
  'Dramatically increased state revenues from natural gas extraction. Funded significant reductions in poverty and inequality, though at the cost of reduced foreign investment.',
  'Q5765432',
  NULL
),

(
  gen_random_uuid(),
  'Renta Dignidad (Dignity Pension)',
  'Renta Dignidad',
  'Universal non-contributory pension for all Bolivians over 60.',
  'A universal old-age pension paid to all Bolivians aged 60 and over regardless of work history or income. Replaced an earlier, less generous program (Bonosol). Funded largely from hydrocarbon revenues. Provides a monthly payment that, while modest, is significant in a country where many elderly people have no other income.',
  '4b82a2c2-cd2e-432f-bcd9-c0285e8018ba',
  'social_welfare',
  'enacted',
  NULL,
  '2007-11-28',
  '2008-02-01',
  NULL,
  8.5,
  'A truly universal pension in one of South America''s poorest countries. Has significantly reduced elderly poverty, especially in rural areas.',
  NULL,
  NULL
),

-- =============================================================================
-- RUSSIA (Soviet era)
-- =============================================================================

(
  gen_random_uuid(),
  'Decree on Land',
  NULL,
  'Abolished private ownership of land and transferred all land to the peasants.',
  'One of the first decrees of the new Soviet government, issued the day after the October Revolution. Abolished private land ownership without compensation, transferred all land to local land committees and soviets of peasant deputies, and prohibited hired labor on the land. Essentially ratified what peasants had already been doing -- seizing landlords'' estates.',
  '5b0ed267-5d0e-4bf3-b61a-bceda642c2f0',
  'economic',
  'enacted',
  NULL,
  '1917-10-26',
  '1917-10-26',
  NULL,
  8.0,
  'Eliminated the Russian landed aristocracy overnight. Gave peasants what they had been demanding for decades, though the land was later collectivized under Stalin.',
  'Q1191035',
  NULL
),

(
  gen_random_uuid(),
  'Soviet Labor Code of 1922',
  NULL,
  'Established the 8-hour workday, paid leave, social insurance, and workplace protections.',
  'The 1922 labor code set the workday at 8 hours (6 for hazardous work), established paid annual leave, mandated social insurance covering sickness, disability, unemployment, and old age, and prohibited child labor under 16. Also established labor dispute resolution procedures. On paper, among the most progressive labor codes in the world at the time.',
  '5b0ed267-5d0e-4bf3-b61a-bceda642c2f0',
  'labor',
  'enacted',
  NULL,
  '1922-11-09',
  '1922-11-09',
  NULL,
  7.0,
  'Extremely progressive on paper but enforcement was uneven and workers had limited ability to challenge management in practice, especially under Stalin.',
  NULL,
  NULL
),

-- =============================================================================
-- MEXICO
-- =============================================================================

(
  gen_random_uuid(),
  'Mexican Constitution of 1917 (Labor and Land Provisions)',
  'Constitucion Politica de los Estados Unidos Mexicanos',
  'First constitution in the world to include social rights -- labor protections, land reform, and education rights.',
  'Article 27 established the nation''s ownership of land and natural resources and provided for land redistribution. Article 123 established the 8-hour workday, the right to strike, minimum wage, equal pay for equal work, and employer liability for workplace injuries. These provisions predated similar protections in most other countries by decades.',
  '7de9d09c-d323-4503-a5b5-415a5a88dd1f',
  'constitutional',
  'amended',
  NULL,
  '1917-02-05',
  '1917-02-05',
  NULL,
  9.0,
  'Revolutionary for its time. The first constitution to enshrine social and economic rights alongside political rights. Influenced constitutions worldwide.',
  'Q179398',
  NULL
),

(
  gen_random_uuid(),
  'Nationalization of the Oil Industry',
  'Expropiacion Petrolera',
  'President Cardenas nationalized all foreign oil companies and created the state oil company Pemex.',
  'On March 18, 1938, President Lazaro Cardenas expropriated all foreign oil company assets after they refused to comply with a Supreme Court ruling on worker wages. Created Petroleos Mexicanos (Pemex) as the state monopoly. The nationalization was enormously popular and March 18 is still celebrated. Foreign companies were eventually compensated.',
  '7de9d09c-d323-4503-a5b5-415a5a88dd1f',
  'economic',
  'enacted',
  NULL,
  '1938-03-18',
  '1938-03-18',
  NULL,
  8.5,
  'A defining moment of Mexican national sovereignty. Showed that a developing country could stand up to foreign capital. Pemex funded Mexican development for decades.',
  'Q909059',
  NULL
),

(
  gen_random_uuid(),
  'Seguro Popular (People''s Health Insurance)',
  'Seguro Popular',
  'Public health insurance program providing coverage to the roughly 50 million Mexicans who lacked it.',
  'Created to cover the half of the Mexican population that had no formal health insurance through employment. Funded through federal and state contributions plus a small family premium. Covered a broad package of essential health services. At its peak covered about 55 million people. Was replaced by INSABI in 2020.',
  '7de9d09c-d323-4503-a5b5-415a5a88dd1f',
  'healthcare',
  'amended',
  NULL,
  '2003-01-01',
  '2004-01-01',
  NULL,
  7.5,
  'Significantly expanded health coverage in Mexico, though quality of care was often poor. Out-of-pocket health spending dropped substantially.',
  'Q2637130',
  NULL
)

ON CONFLICT (id) DO NOTHING;

-- Verify the insert
SELECT COUNT(*) AS policies_inserted FROM policies;
SELECT country_id, COUNT(*) AS policy_count FROM policies GROUP BY country_id ORDER BY policy_count DESC;
SELECT title, country_id, policy_type, status, date_passed FROM policies ORDER BY date_passed ASC;
