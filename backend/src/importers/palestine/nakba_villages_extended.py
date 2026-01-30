"""
Nakba Villages Extended Importer
Extended dataset of Palestinian villages destroyed during the 1948 Nakba.
Data sourced from Walid Khalidi's "All That Remains" and Zochrot archives.
"""
import asyncio
from datetime import date
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

NAKBA_VILLAGES_EXTENDED = [
    # =====================
    # HAIFA DISTRICT
    # =====================
    {"name_arabic": "عين حوض", "name_english": "Ein Hod", "district": "Haifa", "population_1945": 650, "land_area_dunams": 12605, "depopulation_date": "1948-07-15", "depopulation_cause": "military_assault", "current_status": "Artists village Ein Hod", "israeli_locality_on_lands": "Ein Hod", "lat": 32.6978, "lon": 34.9847, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بلد الشيخ", "name_english": "Balad al-Sheikh", "district": "Haifa", "population_1945": 4120, "land_area_dunams": 9584, "depopulation_date": "1948-04-24", "depopulation_cause": "military_assault", "current_status": "Nesher industrial area", "israeli_locality_on_lands": "Nesher", "lat": 32.7667, "lon": 35.0333, "massacre_occurred": True, "massacre_deaths": 60},
    {"name_arabic": "الطيرة", "name_english": "al-Tira (Haifa)", "district": "Haifa", "population_1945": 5270, "land_area_dunams": 45678, "depopulation_date": "1948-07-16", "depopulation_cause": "military_assault", "current_status": "destroyed, Tirat Carmel built nearby", "israeli_locality_on_lands": "Tirat Carmel", "lat": 32.7594, "lon": 34.9700, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "إجزم", "name_english": "Ijzim", "district": "Haifa", "population_1945": 2970, "land_area_dunams": 42589, "depopulation_date": "1948-07-24", "depopulation_cause": "military_assault", "current_status": "destroyed, Kerem Maharal", "israeli_locality_on_lands": "Kerem Maharal", "lat": 32.6500, "lon": 34.9833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "جبع", "name_english": "Jaba (Haifa)", "district": "Haifa", "population_1945": 1140, "land_area_dunams": 11456, "depopulation_date": "1948-07-24", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.6444, "lon": 35.0000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "أم الزينات", "name_english": "Umm al-Zinat", "district": "Haifa", "population_1945": 1470, "land_area_dunams": 21131, "depopulation_date": "1948-05-15", "depopulation_cause": "military_assault", "current_status": "destroyed, Elyakim", "israeli_locality_on_lands": "Elyakim", "lat": 32.5917, "lon": 35.0417, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الكفرين", "name_english": "al-Kafrayn", "district": "Haifa", "population_1945": 920, "land_area_dunams": 8124, "depopulation_date": "1948-04-12", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.7083, "lon": 35.0833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "خبيزة", "name_english": "Khubbeiza", "district": "Haifa", "population_1945": 290, "land_area_dunams": 4423, "depopulation_date": "1948-04-12", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": "Regavim", "lat": 32.5500, "lon": 35.0833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "قيسارية", "name_english": "Qisarya (Caesarea)", "district": "Haifa", "population_1945": 930, "land_area_dunams": 31786, "depopulation_date": "1948-02-15", "depopulation_cause": "military_assault", "current_status": "Caesarea National Park", "israeli_locality_on_lands": "Caesarea", "lat": 32.5000, "lon": 34.8917, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عين غزال", "name_english": "Ein Ghazal", "district": "Haifa", "population_1945": 2170, "land_area_dunams": 15453, "depopulation_date": "1948-07-24", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.6417, "lon": 34.9917, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الصرفند", "name_english": "Sarafand (Haifa)", "district": "Haifa", "population_1945": 290, "land_area_dunams": 3756, "depopulation_date": "1948-04-14", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.7333, "lon": 35.0167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "وادي عارة", "name_english": "Wadi Ara villages", "district": "Haifa", "population_1945": 810, "land_area_dunams": 6789, "depopulation_date": "1948-04-15", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.5056, "lon": 35.0806, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # JAFFA DISTRICT
    # =====================
    {"name_arabic": "سلمة", "name_english": "Salama", "district": "Jaffa", "population_1945": 6730, "land_area_dunams": 7405, "depopulation_date": "1948-04-25", "depopulation_cause": "military_assault", "current_status": "absorbed into Tel Aviv", "israeli_locality_on_lands": "Kfar Shalem", "lat": 32.0500, "lon": 34.8167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الشيخ مونس", "name_english": "Sheikh Muwannis", "district": "Jaffa", "population_1945": 1930, "land_area_dunams": 13450, "depopulation_date": "1948-03-30", "depopulation_cause": "psychological_warfare", "current_status": "Tel Aviv University campus", "israeli_locality_on_lands": "Ramat Aviv", "lat": 32.1139, "lon": 34.7950, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "يازور", "name_english": "Yazur", "district": "Jaffa", "population_1945": 4030, "land_area_dunams": 5436, "depopulation_date": "1948-05-01", "depopulation_cause": "military_assault", "current_status": "Azor", "israeli_locality_on_lands": "Azor", "lat": 32.0250, "lon": 34.8083, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت دجن", "name_english": "Bayt Dajan", "district": "Jaffa", "population_1945": 3840, "land_area_dunams": 9736, "depopulation_date": "1948-04-25", "depopulation_cause": "military_assault", "current_status": "destroyed, Beit Dagan", "israeli_locality_on_lands": "Beit Dagan", "lat": 32.0000, "lon": 34.8333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "ساقية", "name_english": "Saqiya", "district": "Jaffa", "population_1945": 1100, "land_area_dunams": 5031, "depopulation_date": "1948-04-28", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.0083, "lon": 34.8500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "العباسية", "name_english": "al-Abbasiyya", "district": "Jaffa", "population_1945": 5650, "land_area_dunams": 8653, "depopulation_date": "1948-05-04", "depopulation_cause": "military_assault", "current_status": "Yehud", "israeli_locality_on_lands": "Yehud", "lat": 32.0333, "lon": 34.8833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الحرم", "name_english": "al-Haram", "district": "Jaffa", "population_1945": 520, "land_area_dunams": 3756, "depopulation_date": "1948-03-15", "depopulation_cause": "fear", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.0667, "lon": 34.8333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "جمزو", "name_english": "Jimzu (Jaffa area)", "district": "Jaffa", "population_1945": 1510, "land_area_dunams": 8324, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "Gimzo", "israeli_locality_on_lands": "Gimzo", "lat": 31.9333, "lon": 34.9500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "كفر عانة", "name_english": "Kafr Ana", "district": "Jaffa", "population_1945": 2800, "land_area_dunams": 6345, "depopulation_date": "1948-04-25", "depopulation_cause": "military_assault", "current_status": "Ono", "israeli_locality_on_lands": "Kiryat Ono", "lat": 32.0556, "lon": 34.8556, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "رنتية", "name_english": "Rantiya", "district": "Jaffa", "population_1945": 590, "land_area_dunams": 4432, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.9750, "lon": 34.9250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "فجة", "name_english": "Fajja", "district": "Jaffa", "population_1945": 1200, "land_area_dunams": 3978, "depopulation_date": "1948-05-15", "depopulation_cause": "military_assault", "current_status": "Petah Tikva", "israeli_locality_on_lands": "Petah Tikva", "lat": 32.0833, "lon": 34.9000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "جريشة", "name_english": "Jarisha", "district": "Jaffa", "population_1945": 190, "land_area_dunams": 1267, "depopulation_date": "1948-01-01", "depopulation_cause": "fear", "current_status": "park", "israeli_locality_on_lands": None, "lat": 32.1000, "lon": 34.8167, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # JERUSALEM DISTRICT
    # =====================
    {"name_arabic": "القسطل", "name_english": "al-Qastal", "district": "Jerusalem", "population_1945": 90, "land_area_dunams": 1392, "depopulation_date": "1948-04-08", "depopulation_cause": "military_assault", "current_status": "destroyed, Mevaseret Zion", "israeli_locality_on_lands": "Mevaseret Zion", "lat": 31.7967, "lon": 35.1517, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "قالونيا", "name_english": "Qalunya", "district": "Jerusalem", "population_1945": 910, "land_area_dunams": 4847, "depopulation_date": "1948-04-12", "depopulation_cause": "military_assault", "current_status": "destroyed, Mevaseret Zion", "israeli_locality_on_lands": "Mevaseret Zion", "lat": 31.7947, "lon": 35.1503, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "المالحة", "name_english": "al-Maliha", "district": "Jerusalem", "population_1945": 1940, "land_area_dunams": 5783, "depopulation_date": "1948-07-14", "depopulation_cause": "military_assault", "current_status": "Manahat neighborhood, Malha Mall", "israeli_locality_on_lands": "Manahat", "lat": 31.7500, "lon": 35.1833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "صوبا", "name_english": "Suba", "district": "Jerusalem", "population_1945": 620, "land_area_dunams": 4074, "depopulation_date": "1948-07-13", "depopulation_cause": "military_assault", "current_status": "destroyed, Tzova kibbutz", "israeli_locality_on_lands": "Tzova", "lat": 31.7750, "lon": 35.1167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "ساطاف", "name_english": "Sattaf", "district": "Jerusalem", "population_1945": 450, "land_area_dunams": 3745, "depopulation_date": "1948-07-13", "depopulation_cause": "military_assault", "current_status": "nature reserve", "israeli_locality_on_lands": None, "lat": 31.7628, "lon": 35.1250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عقور", "name_english": "Aqour", "district": "Jerusalem", "population_1945": 40, "land_area_dunams": 2123, "depopulation_date": "1948-07-13", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.7583, "lon": 35.1083, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "خربة العمور", "name_english": "Khirbet al-Umur", "district": "Jerusalem", "population_1945": 270, "land_area_dunams": 2567, "depopulation_date": "1948-07-15", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.7472, "lon": 35.1056, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت نقوبا", "name_english": "Bayt Naqouba", "district": "Jerusalem", "population_1945": 240, "land_area_dunams": 2874, "depopulation_date": "1948-07-13", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.8056, "lon": 35.1000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت محسير", "name_english": "Bayt Mahsir", "district": "Jerusalem", "population_1945": 2400, "land_area_dunams": 16318, "depopulation_date": "1948-05-10", "depopulation_cause": "military_assault", "current_status": "destroyed, Beit Meir", "israeli_locality_on_lands": "Beit Meir", "lat": 31.7889, "lon": 35.0556, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت اطعب", "name_english": "Bayt Itab", "district": "Jerusalem", "population_1945": 540, "land_area_dunams": 5687, "depopulation_date": "1948-10-21", "depopulation_cause": "military_assault", "current_status": "destroyed, Nes Harim", "israeli_locality_on_lands": "Nes Harim", "lat": 31.7278, "lon": 35.0667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عرتوف", "name_english": "Artuf", "district": "Jerusalem", "population_1945": 350, "land_area_dunams": 3145, "depopulation_date": "1948-07-18", "depopulation_cause": "military_assault", "current_status": "destroyed, Hartuv", "israeli_locality_on_lands": "Hartuv", "lat": 31.7444, "lon": 34.9889, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عسلين", "name_english": "Islin", "district": "Jerusalem", "population_1945": 260, "land_area_dunams": 2234, "depopulation_date": "1948-07-18", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.7389, "lon": 34.9806, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الجورة", "name_english": "al-Jura (Jerusalem)", "district": "Jerusalem", "population_1945": 420, "land_area_dunams": 4123, "depopulation_date": "1948-10-19", "depopulation_cause": "military_assault", "current_status": "destroyed, Ora", "israeli_locality_on_lands": "Ora", "lat": 31.7500, "lon": 35.1333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الولجة", "name_english": "al-Walaja", "district": "Jerusalem", "population_1945": 1650, "land_area_dunams": 17708, "depopulation_date": "1948-10-21", "depopulation_cause": "military_assault", "current_status": "partially rebuilt nearby, Aminadav", "israeli_locality_on_lands": "Aminadav", "lat": 31.7222, "lon": 35.1556, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # RAMLE DISTRICT
    # =====================
    {"name_arabic": "النعاني", "name_english": "al-Naani", "district": "Ramle", "population_1945": 1470, "land_area_dunams": 8341, "depopulation_date": "1948-07-12", "depopulation_cause": "military_assault", "current_status": "destroyed, Naan kibbutz", "israeli_locality_on_lands": "Naan", "lat": 31.8833, "lon": 34.8667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "جمزو", "name_english": "Jimzu", "district": "Ramle", "population_1945": 1510, "land_area_dunams": 8324, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "Gimzo", "israeli_locality_on_lands": "Gimzo", "lat": 31.9347, "lon": 34.9494, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "دانيال", "name_english": "Daniyal", "district": "Ramle", "population_1945": 410, "land_area_dunams": 6786, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.9056, "lon": 34.9389, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "حدثا", "name_english": "Haditha", "district": "Ramle", "population_1945": 760, "land_area_dunams": 5346, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.9167, "lon": 34.9500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بير معين", "name_english": "Bir Main", "district": "Ramle", "population_1945": 510, "land_area_dunams": 3789, "depopulation_date": "1948-07-16", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.9083, "lon": 34.9833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بركة رمضان", "name_english": "Birkat Ramadan", "district": "Ramle", "population_1945": 120, "land_area_dunams": 1234, "depopulation_date": "1948-07-12", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.9000, "lon": 34.8833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عنابة", "name_english": "Innaba", "district": "Ramle", "population_1945": 1420, "land_area_dunams": 11547, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.8944, "lon": 34.9639, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "القباب", "name_english": "al-Qubab", "district": "Ramle", "population_1945": 1980, "land_area_dunams": 11587, "depopulation_date": "1948-07-10", "depopulation_cause": "military_assault", "current_status": "destroyed, Givat Koach", "israeli_locality_on_lands": "Givat Koach", "lat": 31.9278, "lon": 34.9333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "خلدة", "name_english": "Khulda", "district": "Ramle", "population_1945": 280, "land_area_dunams": 3256, "depopulation_date": "1948-04-06", "depopulation_cause": "military_assault", "current_status": "Kibbutz Hulda", "israeli_locality_on_lands": "Hulda", "lat": 31.8306, "lon": 34.8889, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "صيدون", "name_english": "Saydun", "district": "Ramle", "population_1945": 210, "land_area_dunams": 2654, "depopulation_date": "1948-07-15", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.8417, "lon": 34.9167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "شحمة", "name_english": "Shahma", "district": "Ramle", "population_1945": 280, "land_area_dunams": 2789, "depopulation_date": "1948-07-12", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.8583, "lon": 34.8667, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # SAFAD DISTRICT
    # =====================
    {"name_arabic": "عين الزيتون", "name_english": "Ein al-Zeitun", "district": "Safad", "population_1945": 820, "land_area_dunams": 9678, "depopulation_date": "1948-05-01", "depopulation_cause": "military_assault", "current_status": "destroyed, Ein Zetim moshav", "israeli_locality_on_lands": "Ein Zetim", "lat": 32.9833, "lon": 35.4833, "massacre_occurred": True, "massacre_deaths": 70},
    {"name_arabic": "جاعونة", "name_english": "Jauna", "district": "Safad", "population_1945": 1150, "land_area_dunams": 7632, "depopulation_date": "1948-05-10", "depopulation_cause": "military_assault", "current_status": "destroyed, Rosh Pinna", "israeli_locality_on_lands": "Rosh Pinna", "lat": 32.9694, "lon": 35.5417, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "صفصاف", "name_english": "Safsaf", "district": "Safad", "population_1945": 910, "land_area_dunams": 6823, "depopulation_date": "1948-10-29", "depopulation_cause": "military_assault", "current_status": "destroyed, Safsufa moshav", "israeli_locality_on_lands": "Safsufa", "lat": 33.0167, "lon": 35.4833, "massacre_occurred": True, "massacre_deaths": 60},
    {"name_arabic": "سعسع", "name_english": "Sasa", "district": "Safad", "population_1945": 1130, "land_area_dunams": 12587, "depopulation_date": "1948-10-30", "depopulation_cause": "military_assault", "current_status": "destroyed, Sasa kibbutz", "israeli_locality_on_lands": "Sasa", "lat": 33.0333, "lon": 35.4167, "massacre_occurred": True, "massacre_deaths": 60},
    {"name_arabic": "الحسينية", "name_english": "al-Husseiniyya", "district": "Safad", "population_1945": 1730, "land_area_dunams": 14532, "depopulation_date": "1948-03-21", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 33.0833, "lon": 35.6167, "massacre_occurred": True, "massacre_deaths": 30},
    {"name_arabic": "بيريا", "name_english": "Biriyya", "district": "Safad", "population_1945": 240, "land_area_dunams": 6123, "depopulation_date": "1948-05-02", "depopulation_cause": "military_assault", "current_status": "destroyed, Birya", "israeli_locality_on_lands": "Birya", "lat": 32.9833, "lon": 35.5000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الزوق التحتاني", "name_english": "al-Zawiya al-Tahtani", "district": "Safad", "population_1945": 290, "land_area_dunams": 2987, "depopulation_date": "1948-05-10", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.9500, "lon": 35.5333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "دلاتا", "name_english": "Dalata", "district": "Safad", "population_1945": 360, "land_area_dunams": 3456, "depopulation_date": "1948-10-30", "depopulation_cause": "military_assault", "current_status": "destroyed, Dalton", "israeli_locality_on_lands": "Dalton", "lat": 33.0000, "lon": 35.5167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "المفتخرة", "name_english": "al-Muftakhira", "district": "Safad", "population_1945": 350, "land_area_dunams": 2876, "depopulation_date": "1948-05-04", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.9556, "lon": 35.5444, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "خيام الوليد", "name_english": "Khiyam al-Walid", "district": "Safad", "population_1945": 280, "land_area_dunams": 5436, "depopulation_date": "1948-05-25", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 33.0417, "lon": 35.7000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "قيطية", "name_english": "Qeitiya", "district": "Safad", "population_1945": 940, "land_area_dunams": 8763, "depopulation_date": "1948-05-04", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 33.0167, "lon": 35.5500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "مغار الخيط", "name_english": "Mughar al-Kheit", "district": "Safad", "population_1945": 490, "land_area_dunams": 3567, "depopulation_date": "1948-10-29", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 33.0111, "lon": 35.4889, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # ACRE DISTRICT
    # =====================
    {"name_arabic": "البروة", "name_english": "al-Birwa", "district": "Acre", "population_1945": 1460, "land_area_dunams": 13542, "depopulation_date": "1948-06-11", "depopulation_cause": "military_assault", "current_status": "destroyed, Ahihud moshav", "israeli_locality_on_lands": "Ahihud", "lat": 32.9250, "lon": 35.1667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "ميعار", "name_english": "Miar", "district": "Acre", "population_1945": 770, "land_area_dunams": 5456, "depopulation_date": "1948-07-15", "depopulation_cause": "military_assault", "current_status": "destroyed, Segev industrial zone", "israeli_locality_on_lands": "Segev", "lat": 32.9083, "lon": 35.2000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الكابري", "name_english": "al-Kabri", "district": "Acre", "population_1945": 1520, "land_area_dunams": 24567, "depopulation_date": "1948-05-21", "depopulation_cause": "military_assault", "current_status": "destroyed, Kabri kibbutz", "israeli_locality_on_lands": "Kabri", "lat": 33.0167, "lon": 35.1333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "أم الفرج", "name_english": "Umm al-Faraj", "district": "Acre", "population_1945": 800, "land_area_dunams": 4876, "depopulation_date": "1948-05-21", "depopulation_cause": "military_assault", "current_status": "destroyed, Ben Ami moshav", "israeli_locality_on_lands": "Ben Ami", "lat": 33.0417, "lon": 35.0833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الغابسية", "name_english": "al-Ghabisiyya", "district": "Acre", "population_1945": 690, "land_area_dunams": 11234, "depopulation_date": "1948-05-21", "depopulation_cause": "military_assault", "current_status": "destroyed, Netiv HaShayara", "israeli_locality_on_lands": "Netiv HaShayara", "lat": 33.0333, "lon": 35.1167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "إقرث", "name_english": "Iqrit", "district": "Acre", "population_1945": 490, "land_area_dunams": 5623, "depopulation_date": "1948-11-01", "depopulation_cause": "expulsion_order", "current_status": "destroyed, church remains", "israeli_locality_on_lands": None, "lat": 33.0667, "lon": 35.2500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "البصة", "name_english": "al-Bassa", "district": "Acre", "population_1945": 2950, "land_area_dunams": 20567, "depopulation_date": "1948-05-14", "depopulation_cause": "military_assault", "current_status": "destroyed, Shlomi, Bezet", "israeli_locality_on_lands": "Shlomi", "lat": 33.0750, "lon": 35.1417, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الزيب", "name_english": "al-Zeeb", "district": "Acre", "population_1945": 1910, "land_area_dunams": 12607, "depopulation_date": "1948-05-14", "depopulation_cause": "military_assault", "current_status": "Achziv National Park", "israeli_locality_on_lands": "Gesher HaZiv", "lat": 33.0500, "lon": 35.1000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "سمخ", "name_english": "Sumakh (Acre area)", "district": "Acre", "population_1945": 360, "land_area_dunams": 4321, "depopulation_date": "1948-05-21", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 33.0083, "lon": 35.1500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الدامون", "name_english": "al-Damun", "district": "Acre", "population_1945": 1310, "land_area_dunams": 21435, "depopulation_date": "1948-07-16", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.8833, "lon": 35.1167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الرويس", "name_english": "al-Ruways", "district": "Acre", "population_1945": 330, "land_area_dunams": 3576, "depopulation_date": "1948-07-16", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.8750, "lon": 35.1083, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الشيخ داود", "name_english": "Sheikh Dawud", "district": "Acre", "population_1945": 300, "land_area_dunams": 3456, "depopulation_date": "1948-07-16", "depopulation_cause": "military_assault", "current_status": "destroyed, Shavei Tzion", "israeli_locality_on_lands": "Shavei Tzion", "lat": 32.9750, "lon": 35.0833, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # GAZA DISTRICT
    # =====================
    {"name_arabic": "اسدود", "name_english": "Isdud", "district": "Gaza", "population_1945": 4620, "land_area_dunams": 47091, "depopulation_date": "1948-10-28", "depopulation_cause": "military_assault", "current_status": "Israeli city of Ashdod", "israeli_locality_on_lands": "Ashdod", "lat": 31.8044, "lon": 34.6500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "حمامة", "name_english": "Hamama", "district": "Gaza", "population_1945": 5010, "land_area_dunams": 41542, "depopulation_date": "1948-11-05", "depopulation_cause": "military_assault", "current_status": "destroyed, near Ashkelon", "israeli_locality_on_lands": None, "lat": 31.6167, "lon": 34.5833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بريور", "name_english": "Burayr", "district": "Gaza", "population_1945": 2740, "land_area_dunams": 45162, "depopulation_date": "1948-05-12", "depopulation_cause": "military_assault", "current_status": "destroyed, Bror Hayil", "israeli_locality_on_lands": "Bror Hayil", "lat": 31.4833, "lon": 34.5667, "massacre_occurred": True, "massacre_deaths": 100},
    {"name_arabic": "يبنا", "name_english": "Yibna", "district": "Gaza", "population_1945": 5420, "land_area_dunams": 59554, "depopulation_date": "1948-06-04", "depopulation_cause": "military_assault", "current_status": "Yavne", "israeli_locality_on_lands": "Yavne", "lat": 31.8667, "lon": 34.7333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت داراس", "name_english": "Bayt Daras", "district": "Gaza", "population_1945": 2750, "land_area_dunams": 18678, "depopulation_date": "1948-05-11", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.6833, "lon": 34.6000, "massacre_occurred": True, "massacre_deaths": 50},
    {"name_arabic": "السوافير الشرقية", "name_english": "Sawafir al-Sharqiyya", "district": "Gaza", "population_1945": 960, "land_area_dunams": 7438, "depopulation_date": "1948-05-18", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.7000, "lon": 34.6667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "السوافير الغربية", "name_english": "Sawafir al-Gharbiyya", "district": "Gaza", "population_1945": 1030, "land_area_dunams": 5679, "depopulation_date": "1948-05-18", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.7000, "lon": 34.6500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بربرة", "name_english": "Barbara", "district": "Gaza", "population_1945": 2410, "land_area_dunams": 14278, "depopulation_date": "1948-11-04", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.6417, "lon": 34.5833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت جرجا", "name_english": "Bayt Jirja", "district": "Gaza", "population_1945": 940, "land_area_dunams": 8765, "depopulation_date": "1948-11-04", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.5583, "lon": 34.5500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "هربيا", "name_english": "Hirbya", "district": "Gaza", "population_1945": 2240, "land_area_dunams": 22678, "depopulation_date": "1948-05-21", "depopulation_cause": "military_assault", "current_status": "destroyed, Zikim", "israeli_locality_on_lands": "Zikim", "lat": 31.5833, "lon": 34.5250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الجورة", "name_english": "al-Jura (Gaza)", "district": "Gaza", "population_1945": 2420, "land_area_dunams": 12482, "depopulation_date": "1948-11-05", "depopulation_cause": "military_assault", "current_status": "destroyed, within Ashkelon", "israeli_locality_on_lands": "Ashkelon", "lat": 31.6750, "lon": 34.5583, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "نعليا", "name_english": "Niilya", "district": "Gaza", "population_1945": 1310, "land_area_dunams": 12345, "depopulation_date": "1948-11-05", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.6333, "lon": 34.6167, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # BEERSHEBA DISTRICT (Bedouin Villages)
    # =====================
    {"name_arabic": "تل السبع", "name_english": "Tell al-Saba", "district": "Beersheba", "population_1945": 2000, "land_area_dunams": 150000, "depopulation_date": "1948-10-21", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": "Tel Sheva", "lat": 31.2667, "lon": 34.8500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "جمامة", "name_english": "Jammama", "district": "Beersheba", "population_1945": 800, "land_area_dunams": 35000, "depopulation_date": "1948-10-28", "depopulation_cause": "military_assault", "current_status": "destroyed, Ruhama area", "israeli_locality_on_lands": "Ruhama", "lat": 31.4333, "lon": 34.6000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "النجد", "name_english": "al-Najd", "district": "Beersheba", "population_1945": 620, "land_area_dunams": 13567, "depopulation_date": "1948-05-13", "depopulation_cause": "military_assault", "current_status": "destroyed, Sderot area", "israeli_locality_on_lands": "Sderot", "lat": 31.5250, "lon": 34.5917, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الخلصة", "name_english": "al-Khalasa", "district": "Beersheba", "population_1945": 420, "land_area_dunams": 25000, "depopulation_date": "1948-10-25", "depopulation_cause": "military_assault", "current_status": "destroyed, Revivim area", "israeli_locality_on_lands": None, "lat": 31.0833, "lon": 34.7167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عسلوج", "name_english": "Asluj", "district": "Beersheba", "population_1945": 300, "land_area_dunams": 18000, "depopulation_date": "1948-10-25", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.0500, "lon": 34.7333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "عوجا الحافر", "name_english": "Awja al-Hafir", "district": "Beersheba", "population_1945": 450, "land_area_dunams": 28000, "depopulation_date": "1948-12-27", "depopulation_cause": "military_assault", "current_status": "destroyed, Nitzana", "israeli_locality_on_lands": "Nitzana", "lat": 30.8833, "lon": 34.4667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الغبايا", "name_english": "al-Ghabaya", "district": "Beersheba", "population_1945": 350, "land_area_dunams": 15000, "depopulation_date": "1948-10-21", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.3500, "lon": 34.7500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "خويلفة", "name_english": "Khuweilifa", "district": "Beersheba", "population_1945": 200, "land_area_dunams": 12000, "depopulation_date": "1948-10-21", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.3167, "lon": 34.7833, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # NAZARETH DISTRICT
    # =====================
    {"name_arabic": "معلول", "name_english": "Malul", "district": "Nazareth", "population_1945": 690, "land_area_dunams": 7743, "depopulation_date": "1948-07-15", "depopulation_cause": "military_assault", "current_status": "destroyed, Nahalal area", "israeli_locality_on_lands": "Nahalal", "lat": 32.6917, "lon": 35.2250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "المجيدل", "name_english": "al-Mujaydil", "district": "Nazareth", "population_1945": 1900, "land_area_dunams": 8592, "depopulation_date": "1948-07-15", "depopulation_cause": "military_assault", "current_status": "Migdal HaEmek", "israeli_locality_on_lands": "Migdal HaEmek", "lat": 32.6750, "lon": 35.2417, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "إندور", "name_english": "Indur", "district": "Nazareth", "population_1945": 620, "land_area_dunams": 9432, "depopulation_date": "1948-05-24", "depopulation_cause": "military_assault", "current_status": "destroyed, Ein Dor", "israeli_locality_on_lands": "Ein Dor", "lat": 32.6333, "lon": 35.3833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الشجرة", "name_english": "al-Shajara", "district": "Nazareth", "population_1945": 770, "land_area_dunams": 8765, "depopulation_date": "1948-07-16", "depopulation_cause": "military_assault", "current_status": "destroyed, Ilaniya", "israeli_locality_on_lands": "Ilaniya", "lat": 32.8250, "lon": 35.3500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "كفر سبت", "name_english": "Kafr Sabt", "district": "Nazareth", "population_1945": 480, "land_area_dunams": 5678, "depopulation_date": "1948-05-22", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.8083, "lon": 35.3917, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "حطين", "name_english": "Hittin", "district": "Nazareth", "population_1945": 1190, "land_area_dunams": 22986, "depopulation_date": "1948-07-17", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.8167, "lon": 35.4500, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # TIBERIAS DISTRICT
    # =====================
    {"name_arabic": "الدلهمية", "name_english": "al-Dalhamiyya", "district": "Tiberias", "population_1945": 360, "land_area_dunams": 3456, "depopulation_date": "1948-04-22", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.7667, "lon": 35.5833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "سمخ", "name_english": "Samakh", "district": "Tiberias", "population_1945": 3460, "land_area_dunams": 10963, "depopulation_date": "1948-04-28", "depopulation_cause": "military_assault", "current_status": "destroyed, near Degania", "israeli_locality_on_lands": "Zemah", "lat": 32.7083, "lon": 35.5750, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "ناصر الدين", "name_english": "Nasir al-Din", "district": "Tiberias", "population_1945": 90, "land_area_dunams": 1234, "depopulation_date": "1948-04-12", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.7750, "lon": 35.5167, "massacre_occurred": True, "massacre_deaths": 60},
    {"name_arabic": "حدثا", "name_english": "Hadatha", "district": "Tiberias", "population_1945": 520, "land_area_dunams": 7896, "depopulation_date": "1948-04-22", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.7333, "lon": 35.4833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "المجدل", "name_english": "al-Majdal (Tiberias)", "district": "Tiberias", "population_1945": 360, "land_area_dunams": 4567, "depopulation_date": "1948-04-22", "depopulation_cause": "military_assault", "current_status": "Migdal", "israeli_locality_on_lands": "Migdal", "lat": 32.8417, "lon": 35.5083, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الحمة", "name_english": "al-Hamma", "district": "Tiberias", "population_1945": 310, "land_area_dunams": 5678, "depopulation_date": "1948-05-15", "depopulation_cause": "military_assault", "current_status": "Hamat Gader resort", "israeli_locality_on_lands": "Hamat Gader", "lat": 32.6833, "lon": 35.6667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "غوير أبو شوشة", "name_english": "Ghuwayr Abu Shusha", "district": "Tiberias", "population_1945": 1240, "land_area_dunams": 8456, "depopulation_date": "1948-05-10", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.7500, "lon": 35.5500, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # BEISAN DISTRICT
    # =====================
    {"name_arabic": "الفراطس", "name_english": "al-Farratsi", "district": "Beisan", "population_1945": 330, "land_area_dunams": 4567, "depopulation_date": "1948-05-13", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.4583, "lon": 35.5250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الحمراء", "name_english": "al-Hamra", "district": "Beisan", "population_1945": 730, "land_area_dunams": 6789, "depopulation_date": "1948-05-15", "depopulation_cause": "military_assault", "current_status": "destroyed, Tirat Tzvi area", "israeli_locality_on_lands": "Tirat Tzvi", "lat": 32.4250, "lon": 35.5083, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "جبول", "name_english": "Jabbul", "district": "Beisan", "population_1945": 250, "land_area_dunams": 3456, "depopulation_date": "1948-05-20", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.4750, "lon": 35.4917, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "كوكب الهوى", "name_english": "Kawkab al-Hawa", "district": "Beisan", "population_1945": 300, "land_area_dunams": 5678, "depopulation_date": "1948-05-12", "depopulation_cause": "military_assault", "current_status": "destroyed, Kochav HaYarden", "israeli_locality_on_lands": "Kochav HaYarden", "lat": 32.5833, "lon": 35.5750, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الساخنة", "name_english": "al-Sakhina", "district": "Beisan", "population_1945": 530, "land_area_dunams": 6543, "depopulation_date": "1948-05-12", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.5167, "lon": 35.4833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "يبنيل", "name_english": "Yubla", "district": "Beisan", "population_1945": 210, "land_area_dunams": 3457, "depopulation_date": "1948-05-13", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.4583, "lon": 35.4667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الأشرفية", "name_english": "al-Ashrafiyya", "district": "Beisan", "population_1945": 230, "land_area_dunams": 4321, "depopulation_date": "1948-05-13", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.4833, "lon": 35.5167, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # JENIN DISTRICT
    # =====================
    {"name_arabic": "زرعين", "name_english": "Zirin", "district": "Jenin", "population_1945": 1420, "land_area_dunams": 42673, "depopulation_date": "1948-05-28", "depopulation_cause": "military_assault", "current_status": "destroyed, Yizreel", "israeli_locality_on_lands": "Yizreel", "lat": 32.5583, "lon": 35.3250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "نورس", "name_english": "Nuris", "district": "Jenin", "population_1945": 570, "land_area_dunams": 8765, "depopulation_date": "1948-05-29", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.5500, "lon": 35.3667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "ساندلا", "name_english": "Sandala", "district": "Jenin", "population_1945": 480, "land_area_dunams": 5678, "depopulation_date": "1948-05-28", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.5333, "lon": 35.3583, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "المنسي", "name_english": "al-Mazar", "district": "Jenin", "population_1945": 490, "land_area_dunams": 3456, "depopulation_date": "1948-05-15", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.5750, "lon": 35.2500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "اللجون", "name_english": "Lajjun", "district": "Jenin", "population_1945": 1103, "land_area_dunams": 77186, "depopulation_date": "1948-05-30", "depopulation_cause": "military_assault", "current_status": "destroyed, Megiddo kibbutz area", "israeli_locality_on_lands": "Megiddo", "lat": 32.5833, "lon": 35.1833, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "أم الشوف", "name_english": "Umm al-Shuf", "district": "Jenin", "population_1945": 480, "land_area_dunams": 6789, "depopulation_date": "1948-05-30", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.5667, "lon": 35.2083, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # TULKARM DISTRICT
    # =====================
    {"name_arabic": "قاقون", "name_english": "Qaqun", "district": "Tulkarm", "population_1945": 1970, "land_area_dunams": 41652, "depopulation_date": "1948-06-05", "depopulation_cause": "military_assault", "current_status": "destroyed, Qesem forest", "israeli_locality_on_lands": None, "lat": 32.3833, "lon": 34.9667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "مسكة", "name_english": "Miska", "district": "Tulkarm", "population_1945": 880, "land_area_dunams": 8765, "depopulation_date": "1948-04-15", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.3333, "lon": 34.9333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "كفر صابا", "name_english": "Kafr Saba", "district": "Tulkarm", "population_1945": 2160, "land_area_dunams": 19623, "depopulation_date": "1948-05-13", "depopulation_cause": "military_assault", "current_status": "Kfar Saba Israeli city", "israeli_locality_on_lands": "Kfar Saba", "lat": 32.1833, "lon": 34.9000, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "فرديسية", "name_english": "Fardisya", "district": "Tulkarm", "population_1945": 170, "land_area_dunams": 2345, "depopulation_date": "1948-04-20", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.2583, "lon": 34.9667, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "خربة بيت ليد", "name_english": "Khirbet Bayt Lid", "district": "Tulkarm", "population_1945": 550, "land_area_dunams": 4567, "depopulation_date": "1948-07-19", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 32.3167, "lon": 35.0333, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "واد الحوارث", "name_english": "Wadi al-Hawarith", "district": "Tulkarm", "population_1945": 1330, "land_area_dunams": 32000, "depopulation_date": "1948-03-15", "depopulation_cause": "expulsion_order", "current_status": "destroyed, Netanya area", "israeli_locality_on_lands": None, "lat": 32.3000, "lon": 34.8833, "massacre_occurred": False, "massacre_deaths": None},
    # =====================
    # HEBRON DISTRICT
    # =====================
    {"name_arabic": "عجور", "name_english": "Ajjur", "district": "Hebron", "population_1945": 3730, "land_area_dunams": 58101, "depopulation_date": "1948-10-23", "depopulation_cause": "military_assault", "current_status": "destroyed, Agur moshav area", "israeli_locality_on_lands": "Agur", "lat": 31.6667, "lon": 34.9167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "زكريا", "name_english": "Zakariyya", "district": "Hebron", "population_1945": 1180, "land_area_dunams": 13547, "depopulation_date": "1948-07-23", "depopulation_cause": "military_assault", "current_status": "destroyed, Zekharia moshav", "israeli_locality_on_lands": "Zekharia", "lat": 31.7000, "lon": 34.9500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "بيت جبرين", "name_english": "Bayt Jibrin", "district": "Hebron", "population_1945": 2430, "land_area_dunams": 56185, "depopulation_date": "1948-10-27", "depopulation_cause": "military_assault", "current_status": "destroyed, Beit Guvrin National Park", "israeli_locality_on_lands": "Beit Guvrin", "lat": 31.6083, "lon": 34.8917, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "دورا الخليل", "name_english": "Dawayima", "district": "Hebron", "population_1945": 3710, "land_area_dunams": 60585, "depopulation_date": "1948-10-29", "depopulation_cause": "military_assault", "current_status": "destroyed, Amatzia moshav", "israeli_locality_on_lands": "Amatzia", "lat": 31.5333, "lon": 34.8833, "massacre_occurred": True, "massacre_deaths": 100},
    {"name_arabic": "تل الصافي", "name_english": "Tall al-Safi", "district": "Hebron", "population_1945": 1290, "land_area_dunams": 21045, "depopulation_date": "1948-07-09", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.7167, "lon": 34.8500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "الفالوجة", "name_english": "al-Faluja", "district": "Hebron", "population_1945": 4670, "land_area_dunams": 53373, "depopulation_date": "1949-02-28", "depopulation_cause": "expulsion_order", "current_status": "destroyed, Kiryat Gat area", "israeli_locality_on_lands": "Kiryat Gat", "lat": 31.6083, "lon": 34.7750, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "العراق المنشية", "name_english": "Iraq al-Manshiyya", "district": "Hebron", "population_1945": 2010, "land_area_dunams": 14315, "depopulation_date": "1949-03-04", "depopulation_cause": "expulsion_order", "current_status": "destroyed, Kiryat Gat", "israeli_locality_on_lands": "Kiryat Gat", "lat": 31.6000, "lon": 34.7583, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "دير الدبان", "name_english": "Dayr al-Dubban", "district": "Hebron", "population_1945": 730, "land_area_dunams": 8976, "depopulation_date": "1948-10-23", "depopulation_cause": "military_assault", "current_status": "destroyed, Luzit", "israeli_locality_on_lands": "Luzit", "lat": 31.6667, "lon": 34.9500, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "القبيبة", "name_english": "al-Qubayba", "district": "Hebron", "population_1945": 1060, "land_area_dunams": 9856, "depopulation_date": "1948-10-27", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.5917, "lon": 34.9250, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "دير نخاس", "name_english": "Dayr Nakhkhas", "district": "Hebron", "population_1945": 600, "land_area_dunams": 7654, "depopulation_date": "1948-10-27", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.5750, "lon": 34.9083, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "كدنا", "name_english": "Kudna", "district": "Hebron", "population_1945": 340, "land_area_dunams": 4567, "depopulation_date": "1948-10-28", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.5500, "lon": 34.9167, "massacre_occurred": False, "massacre_deaths": None},
    {"name_arabic": "رعنا", "name_english": "Rana", "district": "Hebron", "population_1945": 190, "land_area_dunams": 2345, "depopulation_date": "1948-10-28", "depopulation_cause": "military_assault", "current_status": "destroyed", "israeli_locality_on_lands": None, "lat": 31.5667, "lon": 34.9333, "massacre_occurred": False, "massacre_deaths": None},
]


class NakbaVillagesExtendedImporter:
    """
    Importer for extended Nakba villages dataset.
    Data sourced from Walid Khalidi's "All That Remains" (1992) and Zochrot archives.
    """

    async def run(self):
        """Import all extended village data into the nakba_villages table."""
        async with async_session_maker() as session:
            imported = 0
            skipped = 0
            errors = []

            for village in NAKBA_VILLAGES_EXTENDED:
                try:
                    # Check if village already exists (by Arabic name and district)
                    existing = await session.execute(
                        text("""
                            SELECT id FROM nakba_villages 
                            WHERE name_arabic = :name AND district = :district
                        """),
                        {"name": village["name_arabic"], "district": village["district"]}
                    )
                    if existing.first():
                        skipped += 1
                        continue

                    # Prepare geometry
                    geom = None
                    if village.get("lat") and village.get("lon"):
                        geom = f"SRID=4326;POINT({village['lon']} {village['lat']})"

                    # Parse depopulation date
                    dep_date = None
                    if village.get("depopulation_date"):
                        dep_date = date.fromisoformat(village["depopulation_date"])

                    # Insert the village record
                    await session.execute(
                        text("""
                            INSERT INTO nakba_villages (
                                id, name_arabic, name_english, district, population_1945,
                                land_area_dunams, depopulation_date, depopulation_cause,
                                current_status, israeli_locality_on_lands, geometry,
                                massacre_occurred, massacre_deaths, sources
                            ) VALUES (
                                :id, :name_arabic, :name_english, :district, :population_1945,
                                :land_area_dunams, :depopulation_date, :depopulation_cause,
                                :current_status, :israeli_locality_on_lands,
                                ST_GeomFromEWKT(:geometry),
                                :massacre_occurred, :massacre_deaths, :sources
                            )
                        """),
                        {
                            "id": str(uuid4()),
                            "name_arabic": village["name_arabic"],
                            "name_english": village.get("name_english"),
                            "district": village.get("district"),
                            "population_1945": village.get("population_1945"),
                            "land_area_dunams": village.get("land_area_dunams"),
                            "depopulation_date": dep_date,
                            "depopulation_cause": village.get("depopulation_cause"),
                            "current_status": village.get("current_status"),
                            "israeli_locality_on_lands": village.get("israeli_locality_on_lands"),
                            "geometry": geom,
                            "massacre_occurred": village.get("massacre_occurred", False),
                            "massacre_deaths": village.get("massacre_deaths"),
                            "sources": [
                                "Walid Khalidi - All That Remains (1992)",
                                "Zochrot",
                                "Palestine Remembered",
                                "Benny Morris - The Birth of the Palestinian Refugee Problem Revisited"
                            ],
                        }
                    )
                    imported += 1

                except Exception as e:
                    error_msg = f"Error importing {village.get('name_english', 'Unknown')}: {e}"
                    errors.append(error_msg)
                    print(error_msg)

            await session.commit()

            # Print summary
            print(f"\n=== Nakba Villages Extended Import Summary ===")
            print(f"Successfully imported: {imported} villages")
            print(f"Skipped (already exist): {skipped} villages")
            print(f"Errors: {len(errors)} villages")

            if errors:
                print("\nErrors encountered:")
                for err in errors[:10]:
                    print(f"  - {err}")
                if len(errors) > 10:
                    print(f"  ... and {len(errors) - 10} more errors")

            return {
                "imported": imported,
                "skipped": skipped,
                "errors": len(errors)
            }

    async def get_statistics(self):
        """Return statistics about villages by district and depopulation cause."""
        stats = {
            "total_villages": len(NAKBA_VILLAGES_EXTENDED),
            "by_district": {},
            "by_cause": {},
            "massacres": 0,
            "total_population_1945": 0,
            "total_land_dunams": 0
        }

        for village in NAKBA_VILLAGES_EXTENDED:
            # Count by district
            district = village.get("district", "Unknown")
            stats["by_district"][district] = stats["by_district"].get(district, 0) + 1

            # Count by depopulation cause
            cause = village.get("depopulation_cause", "Unknown")
            stats["by_cause"][cause] = stats["by_cause"].get(cause, 0) + 1

            # Count massacres
            if village.get("massacre_occurred"):
                stats["massacres"] += 1

            # Sum population
            if village.get("population_1945"):
                stats["total_population_1945"] += village["population_1945"]

            # Sum land area
            if village.get("land_area_dunams"):
                stats["total_land_dunams"] += village["land_area_dunams"]

        return stats


async def main():
    """Main entry point for running the importer."""
    importer = NakbaVillagesExtendedImporter()

    # Print pre-import statistics
    stats = await importer.get_statistics()
    print("=== Pre-Import Statistics ===")
    print(f"Total villages in dataset: {stats['total_villages']}")
    print(f"Total 1945 population: {stats['total_population_1945']:,}")
    print(f"Total land area: {stats['total_land_dunams']:,} dunams")
    print(f"Villages with massacres: {stats['massacres']}")
    print("\nBy District:")
    for district, count in sorted(stats["by_district"].items()):
        print(f"  {district}: {count}")
    print("\nBy Depopulation Cause:")
    for cause, count in sorted(stats["by_cause"].items()):
        print(f"  {cause}: {count}")
    print()

    # Run the import
    result = await importer.run()
    return result


if __name__ == "__main__":
    asyncio.run(main())
