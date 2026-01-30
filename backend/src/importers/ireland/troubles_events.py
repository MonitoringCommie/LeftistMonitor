"""
Troubles Events Importer (1969-1998)
Documents major events during the conflict in Northern Ireland.
Data sources: CAIN Archive, Sutton Index, Pat Finucane Centre, Historical Enquiries Team
"""
import asyncio
from datetime import date
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

# Major Troubles events - documented from historical records
TROUBLES_EVENTS = [
    # 1971
    {
        "name": "Ballymurphy massacre",
        "date": "1971-08-09",
        "date_end": "1971-08-11",
        "location": "Ballymurphy, West Belfast",
        "lat": 54.5847,
        "lon": -5.9981,
        "event_type": "massacre",
        "perpetrator": "British Army (Parachute Regiment)",
        "perpetrator_side": "state",
        "civilian_deaths": 11,
        "total_deaths": 11,
        "collusion_documented": False,
        "description": "Over three days following the introduction of internment without trial, the British Army's Parachute Regiment killed 11 civilians in Ballymurphy estate. Victims included a Catholic priest, Fr Hugh Mullan, shot while waving a white cloth to aid a wounded man, and Joan Connolly, a mother of eight. A 2021 inquest ruled all victims were 'entirely innocent'.",
        "progressive_analysis": "The Ballymurphy massacre was covered up for 50 years. The British state denied wrongdoing until a 2021 inquest proved the victims were innocent civilians. This demonstrates how colonial powers use military violence against occupied populations and then deploy institutional power to suppress the truth for decades."
    },
    {
        "name": "McGurk's Bar bombing",
        "date": "1971-12-04",
        "date_end": "1971-12-04",
        "location": "McGurk's Bar, North Queen Street, Belfast",
        "lat": 54.6056,
        "lon": -5.9344,
        "event_type": "bombing",
        "perpetrator": "UVF (Ulster Volunteer Force)",
        "perpetrator_side": "loyalist",
        "civilian_deaths": 15,
        "total_deaths": 15,
        "collusion_documented": True,
        "description": "A UVF bomb destroyed McGurk's Bar, killing 15 Catholic civilians including two children. Despite evidence pointing to loyalists, the RUC falsely blamed the IRA, claiming it was an 'own goal'. This lie was maintained for years.",
        "progressive_analysis": "McGurk's Bar exemplifies state collusion with loyalist paramilitaries. The RUC deliberately blamed the victims and protected the perpetrators. Documents later proved police knew it was a loyalist attack but suppressed this to protect the narrative that only republicans were violent."
    },
    
    # 1972
    {
        "name": "Bloody Sunday",
        "date": "1972-01-30",
        "date_end": "1972-01-30",
        "location": "Bogside, Derry",
        "lat": 54.9966,
        "lon": -7.3219,
        "event_type": "massacre",
        "perpetrator": "British Army (Parachute Regiment)",
        "perpetrator_side": "state",
        "civilian_deaths": 14,
        "total_deaths": 14,
        "collusion_documented": False,
        "description": "British paratroopers opened fire on a peaceful civil rights march, killing 14 unarmed civilians (13 died immediately, one died later from injuries). The victims were shot while fleeing or helping the wounded. Many were shot in the back. The youngest victim was 17.",
        "progressive_analysis": "Bloody Sunday was a deliberate act of state terror against a civil rights movement demanding basic equality. The subsequent Widgery Tribunal whitewash, which blamed the victims, shows how colonial states use legal institutions to legitimize violence. It took 38 years for the Saville Inquiry to establish the truth: the killings were 'unjustified and unjustifiable'."
    },
    {
        "name": "Bloody Friday",
        "date": "1972-07-21",
        "date_end": "1972-07-21",
        "location": "Belfast city centre",
        "lat": 54.5973,
        "lon": -5.9301,
        "event_type": "bombing_campaign",
        "perpetrator": "IRA (Provisional Irish Republican Army)",
        "perpetrator_side": "republican",
        "civilian_deaths": 9,
        "total_deaths": 9,
        "collusion_documented": False,
        "description": "The IRA detonated 22 bombs across Belfast in approximately 80 minutes, killing 9 people including civilians. The bombings were condemned across Ireland and damaged support for republicanism.",
        "progressive_analysis": "Bloody Friday represents the dangers of armed struggle tactics that harm civilians. While republicans argued this was a response to state violence, the killing of civilians undermined the moral authority of the anti-colonial struggle and was criticized by many within the broader republican movement."
    },
    
    # 1974
    {
        "name": "Dublin and Monaghan bombings",
        "date": "1974-05-17",
        "date_end": "1974-05-17",
        "location": "Dublin and Monaghan, Republic of Ireland",
        "lat": 53.3498,
        "lon": -6.2603,
        "event_type": "bombing",
        "perpetrator": "UVF (Ulster Volunteer Force)",
        "perpetrator_side": "loyalist",
        "civilian_deaths": 34,
        "total_deaths": 34,
        "collusion_documented": True,
        "description": "Four car bombs exploded during rush hour - three in Dublin and one in Monaghan - killing 34 civilians including a pregnant woman and an unborn child. It remains the deadliest single attack of the Troubles. No one has ever been convicted.",
        "progressive_analysis": "Evidence strongly indicates British intelligence and security forces assisted the UVF in this attack, including providing the explosives. The Barron Report found the Garda investigation was blocked by refusal of British cooperation. This represents the apex of state-loyalist collusion - the British state using proxy forces to attack a neighboring country's civilian population."
    },
    
    # 1978
    {
        "name": "La Mon restaurant bombing",
        "date": "1978-02-17",
        "date_end": "1978-02-17",
        "location": "La Mon House, Gransha, County Down",
        "lat": 54.5506,
        "lon": -5.8014,
        "event_type": "bombing",
        "perpetrator": "IRA (Provisional Irish Republican Army)",
        "perpetrator_side": "republican",
        "civilian_deaths": 12,
        "total_deaths": 12,
        "collusion_documented": False,
        "description": "An IRA incendiary bomb devastated La Mon House hotel during an Irish Collie Club dinner dance, killing 12 Protestant civilians. The bomb created a fireball that incinerated victims. A telephone warning was given too late.",
        "progressive_analysis": "La Mon was one of the most controversial IRA operations of the Troubles. The horrific nature of the deaths caused revulsion across Ireland. It illustrated how armed struggle could produce atrocities that harmed the cause it claimed to serve and caused immense suffering to civilians."
    },
    
    # 1981
    {
        "name": "1981 Hunger Strikes",
        "date": "1981-03-01",
        "date_end": "1981-10-03",
        "location": "HM Prison Maze (Long Kesh), County Antrim",
        "lat": 54.4947,
        "lon": -6.0922,
        "event_type": "hunger_strike",
        "perpetrator": "British Government (Thatcher administration)",
        "perpetrator_side": "state",
        "civilian_deaths": 0,
        "total_deaths": 10,
        "collusion_documented": False,
        "description": "Ten Irish republican prisoners died on hunger strike demanding political status: Bobby Sands (elected MP while dying), Francis Hughes, Raymond McCreesh, Patsy O'Hara, Joe McDonnell, Martin Hurson, Kevin Lynch, Kieran Doherty (TD), Thomas McElwee, and Michael Devine. Margaret Thatcher refused all compromise.",
        "progressive_analysis": "The hunger strikes represent the ultimate form of resistance against colonial criminalization. Britain sought to delegitimize the republican movement by treating political prisoners as criminals. The strikers' sacrifice galvanized international support and transformed Sinn Fein into an electoral force. Bobby Sands' election while on hunger strike exposed the contradiction of British 'democracy' in Ireland."
    },
    
    # 1984
    {
        "name": "Brighton hotel bombing",
        "date": "1984-10-12",
        "date_end": "1984-10-12",
        "location": "Grand Brighton Hotel, Brighton, England",
        "lat": 50.8214,
        "lon": -0.1494,
        "event_type": "bombing",
        "perpetrator": "IRA (Provisional Irish Republican Army)",
        "perpetrator_side": "republican",
        "civilian_deaths": 5,
        "total_deaths": 5,
        "collusion_documented": False,
        "description": "The IRA bombed the Grand Hotel during the Conservative Party conference, targeting Prime Minister Margaret Thatcher. Five people were killed and 31 injured. Thatcher narrowly survived. The IRA stated: 'Today we were unlucky, but remember we only have to be lucky once.'",
        "progressive_analysis": "The Brighton bombing represented an attempt to strike at the political leadership responsible for the hunger strike deaths. While targeting the state apparatus rather than civilians, the deaths of non-combatants illustrated the moral complexities of armed struggle against an occupying power."
    },
    
    # 1987
    {
        "name": "Enniskillen bombing (Remembrance Day)",
        "date": "1987-11-08",
        "date_end": "1987-11-08",
        "location": "Enniskillen, County Fermanagh",
        "lat": 54.3438,
        "lon": -7.6315,
        "event_type": "bombing",
        "perpetrator": "IRA (Provisional Irish Republican Army)",
        "perpetrator_side": "republican",
        "civilian_deaths": 12,
        "total_deaths": 12,
        "collusion_documented": False,
        "description": "An IRA bomb exploded at a Remembrance Day ceremony, killing 11 civilians and one off-duty RUC officer. Victims were crushed under falling masonry. The attack was widely condemned, including by many republicans.",
        "progressive_analysis": "Enniskillen damaged the republican cause internationally and domestically. Gordon Wilson's forgiveness of those who killed his daughter Marie became a symbol of reconciliation but also highlighted the human cost of armed struggle. The attack forced reflection within republicanism about tactics and targets."
    },
    {
        "name": "Loughgall ambush",
        "date": "1987-05-08",
        "date_end": "1987-05-08",
        "location": "Loughgall, County Armagh",
        "lat": 54.4072,
        "lon": -6.6022,
        "event_type": "ambush",
        "perpetrator": "British Army (SAS)",
        "perpetrator_side": "state",
        "civilian_deaths": 1,
        "total_deaths": 9,
        "collusion_documented": False,
        "description": "The SAS ambushed an IRA unit attacking Loughgall RUC station, killing 8 IRA volunteers and one civilian passerby. It was the IRA's largest loss of life in a single incident. Questions remain about whether arrests could have been made instead of a kill operation.",
        "progressive_analysis": "Loughgall exemplified Britain's 'shoot-to-kill' policy - using military force to eliminate republicans rather than arrest and try them. The killing of civilian Anthony Hughes and the failure to warn or apprehend suggests a policy of extrajudicial execution rather than law enforcement."
    },
    
    # 1988
    {
        "name": "Gibraltar killings (Operation Flavius)",
        "date": "1988-03-06",
        "date_end": "1988-03-06",
        "location": "Gibraltar",
        "lat": 36.1408,
        "lon": -5.3536,
        "event_type": "extrajudicial_killing",
        "perpetrator": "British Army (SAS)",
        "perpetrator_side": "state",
        "civilian_deaths": 0,
        "total_deaths": 3,
        "collusion_documented": False,
        "description": "The SAS shot dead three unarmed IRA volunteers - Mairead Farrell, Sean Savage, and Daniel McCann - in Gibraltar. They were planning a bomb attack but were unarmed when killed. Witnesses described executions of people attempting to surrender.",
        "progressive_analysis": "The Gibraltar killings demonstrated Britain's policy of extrajudicial execution. The victims could have been arrested - they were under surveillance and unarmed. The European Court of Human Rights ruled Britain violated the right to life. The killings led directly to the Milltown and corporals killings."
    },
    {
        "name": "Milltown Cemetery attack",
        "date": "1988-03-16",
        "date_end": "1988-03-16",
        "location": "Milltown Cemetery, Belfast",
        "lat": 54.5728,
        "lon": -5.9667,
        "event_type": "attack",
        "perpetrator": "UDA (Ulster Defence Association)",
        "perpetrator_side": "loyalist",
        "civilian_deaths": 3,
        "total_deaths": 3,
        "collusion_documented": True,
        "description": "Loyalist Michael Stone attacked the funeral of the Gibraltar Three with grenades and pistols, killing 3 mourners and wounding over 60. The attack was filmed by television crews. Stone was later revealed to have been a state agent.",
        "progressive_analysis": "The Milltown attack occurred during a funeral for those killed by the state in Gibraltar, demonstrating the symbiotic relationship between state violence and loyalist violence. Stone's connections to British intelligence revealed later exemplify how the state used loyalist paramilitaries as proxy forces."
    },
    
    # 1998
    {
        "name": "Omagh bombing",
        "date": "1998-08-15",
        "date_end": "1998-08-15",
        "location": "Omagh, County Tyrone",
        "lat": 54.5978,
        "lon": -7.3022,
        "event_type": "bombing",
        "perpetrator": "Real IRA",
        "perpetrator_side": "republican",
        "civilian_deaths": 29,
        "total_deaths": 29,
        "collusion_documented": False,
        "description": "A Real IRA car bomb killed 29 people (including a woman pregnant with twins) and injured over 200 in Omagh town centre. It was the deadliest single incident of the Troubles. The attack occurred after the Good Friday Agreement, by a splinter group opposed to the peace process.",
        "progressive_analysis": "Omagh represented both the horror of continued violence and the failure of dissident republicanism to offer an alternative to the peace process. The overwhelming public rejection of the bombing, including from mainstream republicans, demonstrated that armed struggle had lost legitimacy. Evidence that British intelligence had prior warning but failed to act raised questions about state responsibility."
    },
]


class TroublesEventsImporter:
    async def run(self):
        async with async_session_maker() as session:
            # Get Ireland/Northern Ireland country IDs if they exist
            result = await session.execute(
                text("SELECT id FROM countries WHERE name_en ILIKE '%ireland%' LIMIT 1")
            )
            row = result.first()
            ireland_id = str(row[0]) if row else None

            imported = 0
            for event in TROUBLES_EVENTS:
                try:
                    # Check if event already exists
                    existing = await session.execute(
                        text("SELECT id FROM troubles_events WHERE name = :name"),
                        {"name": event["name"]}
                    )
                    if existing.first():
                        print(f"Skipping existing: {event['name']}")
                        continue

                    # Create geometry from lat/lon
                    geom = f"SRID=4326;POINT({event['lon']} {event['lat']})" if event.get("lat") else None
                    
                    # Parse dates
                    event_date = date.fromisoformat(event["date"]) if event.get("date") else None
                    event_date_end = date.fromisoformat(event["date_end"]) if event.get("date_end") else None

                    await session.execute(
                        text("""
                            INSERT INTO troubles_events (
                                id, name, date, date_end, location, country_id,
                                geometry, event_type, perpetrator, perpetrator_side,
                                civilian_deaths, total_deaths, collusion_documented,
                                description, progressive_analysis, sources
                            ) VALUES (
                                :id, :name, :date, :date_end, :location, :country_id,
                                ST_GeomFromEWKT(:geometry), :event_type, :perpetrator,
                                :perpetrator_side, :civilian_deaths, :total_deaths,
                                :collusion_documented, :description, :progressive_analysis,
                                :sources
                            )
                        """),
                        {
                            "id": str(uuid4()),
                            "name": event["name"],
                            "date": event_date,
                            "date_end": event_date_end,
                            "location": event.get("location"),
                            "country_id": ireland_id,
                            "geometry": geom,
                            "event_type": event.get("event_type"),
                            "perpetrator": event.get("perpetrator"),
                            "perpetrator_side": event.get("perpetrator_side"),
                            "civilian_deaths": event.get("civilian_deaths"),
                            "total_deaths": event.get("total_deaths"),
                            "collusion_documented": event.get("collusion_documented", False),
                            "description": event.get("description"),
                            "progressive_analysis": event.get("progressive_analysis"),
                            "sources": ["CAIN Archive", "Sutton Index", "Pat Finucane Centre", "Historical Enquiries Team"],
                        }
                    )
                    imported += 1
                    print(f"Imported: {event['name']}")
                except Exception as e:
                    print(f"Error importing {event.get('name')}: {e}")

            await session.commit()
            print(f"Successfully imported {imported} Troubles events")
            return imported


async def main():
    importer = TroublesEventsImporter()
    await importer.run()


if __name__ == "__main__":
    asyncio.run(main())
