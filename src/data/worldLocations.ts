// Comprehensive world location data for agricultural contexts
// This includes major agricultural regions around the world

export const worldLocations: Record<string, Record<string, string[]>> = {
  // Africa
  "Nigeria": {
    "Abia": ["Aba North", "Aba South", "Umuahia North", "Umuahia South"],
    "Lagos": ["Ikeja", "Surulere", "Lagos Island", "Ikorodu", "Badagry"],
    "Kano": ["Kano Municipal", "Gwale", "Dala", "Nassarawa"],
    // Add more as needed
  },
  "Kenya": {
    "Nairobi": ["Westlands", "Kasarani", "Embakasi", "Dagoretti"],
    "Mombasa": ["Mvita", "Nyali", "Kisauni", "Likoni"],
    "Kiambu": ["Thika", "Ruiru", "Kikuyu", "Limuru"],
    "Nakuru": ["Nakuru Town", "Naivasha", "Gilgil", "Molo"],
  },
  "Ghana": {
    "Greater Accra": ["Accra Metropolitan", "Tema", "Ga East", "Ga West"],
    "Ashanti": ["Kumasi Metropolitan", "Obuasi", "Ejisu", "Mampong"],
    "Northern": ["Tamale", "Yendi", "Savelugu", "Gushegu"],
  },
  "South Africa": {
    "Gauteng": ["Johannesburg", "Pretoria", "Soweto", "Sandton"],
    "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "Worcester"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle"],
  },
  "Egypt": {
    "Cairo": ["Nasr City", "Heliopolis", "Maadi", "Giza"],
    "Alexandria": ["Montaza", "Borg El Arab", "Agami", "Miami"],
    "Giza": ["6th October City", "Sheikh Zayed", "Dokki", "Haram"],
  },
  "Ethiopia": {
    "Addis Ababa": ["Bole", "Yeka", "Kirkos", "Arada"],
    "Oromia": ["Adama", "Jimma", "Bishoftu", "Ambo"],
    "Amhara": ["Bahir Dar", "Gondar", "Dessie", "Debre Birhan"],
  },
  
  // Asia
  "India": {
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Karnal"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Kolhapur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  },
  "China": {
    "Shandong": ["Jinan", "Qingdao", "Yantai", "Weifang"],
    "Henan": ["Zhengzhou", "Luoyang", "Kaifeng", "Anyang"],
    "Jiangsu": ["Nanjing", "Suzhou", "Wuxi", "Changzhou"],
    "Hebei": ["Shijiazhuang", "Tangshan", "Baoding", "Handan"],
  },
  "Pakistan": {
    "Punjab": ["Lahore", "Faisalabad", "Multan", "Gujranwala", "Sialkot"],
    "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana"],
    "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Abbottabad", "Swat"],
  },
  "Bangladesh": {
    "Dhaka": ["Dhaka North", "Dhaka South", "Gazipur", "Narayanganj"],
    "Chittagong": ["Chittagong City", "Cox's Bazar", "Comilla", "Feni"],
    "Rajshahi": ["Rajshahi City", "Bogra", "Pabna", "Sirajganj"],
  },
  "Indonesia": {
    "Java": ["Jakarta", "Surabaya", "Bandung", "Semarang", "Yogyakarta"],
    "Sumatra": ["Medan", "Palembang", "Pekanbaru", "Padang"],
    "Bali": ["Denpasar", "Ubud", "Singaraja", "Gianyar"],
  },
  "Thailand": {
    "Central": ["Bangkok", "Nonthaburi", "Pathum Thani", "Samut Prakan"],
    "North": ["Chiang Mai", "Chiang Rai", "Lamphun", "Lampang"],
    "Northeast": ["Nakhon Ratchasima", "Udon Thani", "Khon Kaen", "Ubon Ratchathani"],
  },
  "Vietnam": {
    "Red River Delta": ["Hanoi", "Hai Phong", "Nam Dinh", "Thai Binh"],
    "Mekong Delta": ["Can Tho", "Long An", "Tien Giang", "Ben Tre"],
    "Southeast": ["Ho Chi Minh City", "Binh Duong", "Dong Nai", "Ba Ria-Vung Tau"],
  },
  
  // Americas
  "United States": {
    "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City"],
    "California": ["Fresno", "Bakersfield", "Salinas", "Modesto", "Stockton"],
    "Texas": ["Houston", "Dallas", "San Antonio", "Austin", "Lubbock"],
    "Illinois": ["Chicago", "Springfield", "Peoria", "Rockford"],
    "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka"],
    "Nebraska": ["Omaha", "Lincoln", "Grand Island", "Kearney"],
  },
  "Brazil": {
    "São Paulo": ["São Paulo", "Campinas", "Ribeirão Preto", "Sorocaba"],
    "Mato Grosso": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop"],
    "Paraná": ["Curitiba", "Londrina", "Maringá", "Cascavel"],
    "Rio Grande do Sul": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Santa Maria"],
    "Goiás": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde"],
  },
  "Argentina": {
    "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca", "Tandil"],
    "Córdoba": ["Córdoba City", "Río Cuarto", "Villa María", "San Francisco"],
    "Santa Fe": ["Rosario", "Santa Fe City", "Rafaela", "Venado Tuerto"],
    "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay"],
  },
  "Mexico": {
    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"],
    "Sinaloa": ["Culiacán", "Mazatlán", "Los Mochis", "Guasave"],
    "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba"],
    "Sonora": ["Hermosillo", "Ciudad Obregón", "Nogales", "San Luis Río Colorado"],
  },
  "Canada": {
    "Saskatchewan": ["Regina", "Saskatoon", "Prince Albert", "Moose Jaw"],
    "Alberta": ["Calgary", "Edmonton", "Lethbridge", "Red Deer"],
    "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Portage la Prairie"],
    "Ontario": ["Toronto", "Ottawa", "London", "Hamilton"],
  },
  
  // Europe
  "France": {
    "Île-de-France": ["Paris", "Versailles", "Meaux", "Melun"],
    "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau"],
    "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan"],
    "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand"],
  },
  "Germany": {
    "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg"],
    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen"],
    "Baden-Württemberg": ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg"],
    "Lower Saxony": ["Hanover", "Brunswick", "Osnabrück", "Oldenburg"],
  },
  "Italy": {
    "Lombardy": ["Milan", "Brescia", "Bergamo", "Monza"],
    "Veneto": ["Venice", "Verona", "Padua", "Vicenza"],
    "Emilia-Romagna": ["Bologna", "Parma", "Modena", "Reggio Emilia"],
    "Piedmont": ["Turin", "Alessandria", "Asti", "Cuneo"],
  },
  "Spain": {
    "Andalusia": ["Seville", "Málaga", "Córdoba", "Granada"],
    "Catalonia": ["Barcelona", "Tarragona", "Girona", "Lleida"],
    "Castile and León": ["Valladolid", "León", "Burgos", "Salamanca"],
    "Aragon": ["Zaragoza", "Huesca", "Teruel"],
  },
  "Ukraine": {
    "Kyiv Oblast": ["Kyiv", "Bila Tserkva", "Brovary", "Fastiv"],
    "Dnipropetrovsk Oblast": ["Dnipro", "Kryvyi Rih", "Kamianske", "Nikopol"],
    "Kharkiv Oblast": ["Kharkiv", "Chuhuiv", "Izium", "Kupiansk"],
    "Odesa Oblast": ["Odesa", "Chornomorsk", "Bilhorod-Dnistrovskyi", "Izmail"],
  },
  "Poland": {
    "Masovian": ["Warsaw", "Radom", "Płock", "Ostrołęka"],
    "Greater Poland": ["Poznań", "Kalisz", "Konin", "Piła"],
    "Lower Silesian": ["Wrocław", "Wałbrzych", "Legnica", "Jelenia Góra"],
  },
  "Romania": {
    "Muntenia": ["Bucharest", "Ploiești", "Pitești", "Târgoviște"],
    "Transylvania": ["Cluj-Napoca", "Brașov", "Sibiu", "Târgu Mureș"],
    "Moldavia": ["Iași", "Galați", "Bacău", "Piatra Neamț"],
  },
  
  // Australia & Oceania
  "Australia": {
    "New South Wales": ["Sydney", "Wagga Wagga", "Dubbo", "Tamworth"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    "Queensland": ["Brisbane", "Toowoomba", "Rockhampton", "Mackay"],
    "Western Australia": ["Perth", "Bunbury", "Geraldton", "Kalgoorlie"],
    "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge"],
  },
  "New Zealand": {
    "Auckland": ["Auckland City", "Manukau", "North Shore", "Waitakere"],
    "Canterbury": ["Christchurch", "Timaru", "Ashburton", "Rangiora"],
    "Waikato": ["Hamilton", "Tauranga", "Rotorua", "Tokoroa"],
  },
};
