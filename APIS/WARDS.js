const WARDS = [
    {
        "ZoneNo": 1,
        "WardNo": 1,
        "WardName": "GARGAJ",
        "District": 407
    },
    {
        "ZoneNo": 1,
        "WardNo": 4,
        "WardName": "KOTESHWAR",
        "District": 407
    },
    {
        "ZoneNo": 1,
        "WardNo": 5,
        "WardName": "TAMESHWAR",
        "District": 407
    },
    {
        "ZoneNo": 2,
        "WardNo": 6,
        "WardName": "MANGLESHWAR",
        "District": 407
    },
    {
        "ZoneNo": 2,
        "WardNo": 9,
        "WardName": "KASHI NARESH",
        "District": 407
    },
    {
        "ZoneNo": 2,
        "WardNo": 10,
        "WardName": "SHAHEED BHANU SWAROOP DUBEY",
        "District": 407
    },
    {
        "ZoneNo": 3,
        "WardNo": 7,
        "WardName": "INDRA",
        "District": 407
    },
    {
        "ZoneNo": 3,
        "WardNo": 8,
        "WardName": "SHRAMIK",
        "District": 407
    },
    {
        "ZoneNo": 3,
        "WardNo": 15,
        "WardName": "MADHAVI",
        "District": 407
    },
    {
        "ZoneNo": 4,
        "WardNo": 11,
        "WardName": "CHANDRASEKHAR",
        "District": 407
    },
    {
        "ZoneNo": 4,
        "WardNo": 13,
        "WardName": "SANGEET SAMRAT TANSEN",
        "District": 407
    },
    {
        "ZoneNo": 4,
        "WardNo": 14,
        "WardName": "SEWA NAGAR ",
        "District": 407
    },
    {
        "ZoneNo": 5,
        "WardNo": 12,
        "WardName": "SUBHASH",
        "District": 407
    },
    {
        "ZoneNo": 5,
        "WardNo": 16,
        "WardName": "LAL BAHADUR SHASHTRI",
        "District": 407
    },
    {
        "ZoneNo": 5,
        "WardNo": 17,
        "WardName": "CHHATRAPATI SHIVAJI",
        "District": 407
    },
    {
        "ZoneNo": 6,
        "WardNo": 31,
        "WardName": "DR. RAJENDRA PRASAD",
        "District": 407
    },
    {
        "ZoneNo": 6,
        "WardNo": 32,
        "WardName": "VEERANGANA LAKSHMI BAI",
        "District": 407
    },
    {
        "ZoneNo": 7,
        "WardNo": 2,
        "WardName": "BHUTESHWAR",
        "District": 407
    },
    {
        "ZoneNo": 7,
        "WardNo": 3,
        "WardName": "SHABD PRATAP ASHRAM",
        "District": 407
    },
    {
        "ZoneNo": 7,
        "WardNo": 33,
        "WardName": "SANT RAVIDAS",
        "District": 407
    },
    {
        "ZoneNo": 7,
        "WardNo": 36,
        "WardName": "RAJIV",
        "District": 407
    },
    {
        "ZoneNo": 8,
        "WardNo": 18,
        "WardName": "TILAK",
        "District": 407
    },
    {
        "ZoneNo": 8,
        "WardNo": 19,
        "WardName": "MAHARANA PRATAP",
        "District": 407
    },
    {
        "ZoneNo": 8,
        "WardNo": 25,
        "WardName": "SHAHEED BHAGAT SINGH",
        "District": 407
    },
    {
        "ZoneNo": 9,
        "WardNo": 20,
        "WardName": "DR. HARI RAM CHANDRA DIWAKAR",
        "District": 407
    },
    {
        "ZoneNo": 9,
        "WardNo": 26,
        "WardName": "DR. HARIHAR NIWAS DWIVEDI",
        "District": 407
    },
    {
        "ZoneNo": 9,
        "WardNo": 27,
        "WardName": "SHYAMLAL PANDVIY",
        "District": 407
    },
    {
        "ZoneNo": 10,
        "WardNo": 21,
        "WardName": "PANCHSHEEL",
        "District": 407
    },
    {
        "ZoneNo": 10,
        "WardNo": 22,
        "WardName": "KABIR",
        "District": 407
    },
    {
        "ZoneNo": 10,
        "WardNo": 23,
        "WardName": "DWARKADHEESH",
        "District": 407
    },
    {
        "ZoneNo": 11,
        "WardNo": 24,
        "WardName": "SWAMI DAYANAND",
        "District": 407
    },
    {
        "ZoneNo": 11,
        "WardNo": 28,
        "WardName": "SHANTI NIKETAN",
        "District": 407
    },
    {
        "ZoneNo": 11,
        "WardNo": 30,
        "WardName": "CAPTAIN ROOPSINGH",
        "District": 407
    },
    {
        "ZoneNo": 12,
        "WardNo": 45,
        "WardName": "METHLI SARAN GUPT",
        "District": 407
    },
    {
        "ZoneNo": 12,
        "WardNo": 56,
        "WardName": "LOHIA",
        "District": 407
    },
    {
        "ZoneNo": 13,
        "WardNo": 57,
        "WardName": "SANJAY GANDHI",
        "District": 407
    },
    {
        "ZoneNo": 13,
        "WardNo": 58,
        "WardName": "MAHAD JI SINDHIYA",
        "District": 407
    },
    {
        "ZoneNo": 13,
        "WardNo": 59,
        "WardName": "HARI SINGH DARSHAN SINGH",
        "District": 407
    },
    {
        "ZoneNo": 14,
        "WardNo": 29,
        "WardName": "SWAMI VIVEKANAND",
        "District": 407
    },
    {
        "ZoneNo": 14,
        "WardNo": 60,
        "WardName": "PANDIT RAVI SHANKAR",
        "District": 407
    },
    {
        "ZoneNo": 15,
        "WardNo": 34,
        "WardName": "MAHATMA GANDHI",
        "District": 407
    },
    {
        "ZoneNo": 15,
        "WardNo": 42,
        "WardName": "HEMUKALANI",
        "District": 407
    },
    {
        "ZoneNo": 15,
        "WardNo": 43,
        "WardName": "SANT JHULELAL",
        "District": 407
    },
    {
        "ZoneNo": 16,
        "WardNo": 35,
        "WardName": "LALA LAJPAT RAY",
        "District": 407
    },
    {
        "ZoneNo": 16,
        "WardNo": 37,
        "WardName": "USTAJ HAFIZ ALI KHAN",
        "District": 407
    },
    {
        "ZoneNo": 16,
        "WardNo": 41,
        "WardName": "MAHARAJ DHOLIBUA MATH",
        "District": 407
    },
    {
        "ZoneNo": 17,
        "WardNo": 38,
        "WardName": "AMBEDKAR",
        "District": 407
    },
    {
        "ZoneNo": 17,
        "WardNo": 39,
        "WardName": "TATYA TOPE",
        "District": 407
    },
    {
        "ZoneNo": 18,
        "WardNo": 40,
        "WardName": "BHIKAM CHANDRA JAIN",
        "District": 407
    },
    {
        "ZoneNo": 18,
        "WardNo": 49,
        "WardName": "MAHATMA JYOTIBA PHULE",
        "District": 407
    },
    {
        "ZoneNo": 19,
        "WardNo": 44,
        "WardName": "SHAHID AMAR CHANDRA BATHIA",
        "District": 407
    },
    {
        "ZoneNo": 19,
        "WardNo": 46,
        "WardName": "ACHLESHWAR",
        "District": 407
    },
    {
        "ZoneNo": 19,
        "WardNo": 50,
        "WardName": "MANSUR SHAH DATA",
        "District": 407
    },
    {
        "ZoneNo": 20,
        "WardNo": 47,
        "WardName": "PT. KRISHNARAO SHANKARRAO",
        "District": 407
    },
    {
        "ZoneNo": 20,
        "WardNo": 48,
        "WardName": "SHAHID CAPTAIN GORE",
        "District": 407
    },
    {
        "ZoneNo": 20,
        "WardNo": 51,
        "WardName": "ASHFAQULLA KHAN",
        "District": 407
    },
    {
        "ZoneNo": 20,
        "WardNo": 53,
        "WardName": "MAJOR KARTAR SINGH",
        "District": 407
    },
    {
        "ZoneNo": 21,
        "WardNo": 52,
        "WardName": "JAGJIVAN",
        "District": 407
    },
    {
        "ZoneNo": 21,
        "WardNo": 54,
        "WardName": "JAWAHAR",
        "District": 407
    },
    {
        "ZoneNo": 21,
        "WardNo": 55,
        "WardName": "MAQBOOL AHMED",
        "District": 407
    },
    {
        "ZoneNo": 22,
        "WardNo": 61,
        "WardName": "SIROTHA BAI",
        "District": 407
    },
    {
        "ZoneNo": 22,
        "WardNo": 62,
        "WardName": "BHADROLI",
        "District": 407
    },
    {
        "ZoneNo": 23,
        "WardNo": 63,
        "WardName": "JAMAHAR",
        "District": 407
    },
    {
        "ZoneNo": 23,
        "WardNo": 64,
        "WardName": "PURANI CHHAWNI",
        "District": 407
    },
    {
        "ZoneNo": 24,
        "WardNo": 65,
        "WardName": "GIRWAI",
        "District": 407
    },
    {
        "ZoneNo": 25,
        "WardNo": 66,
        "WardName": "NAUWGAON",
        "District": 407
    }
]