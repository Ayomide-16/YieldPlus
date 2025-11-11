// Comprehensive world location data for agricultural contexts
// This includes major agricultural regions around the world

export const worldLocations: Record<string, Record<string, string[]>> = {
  // Africa
  "Nigeria": {
    "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"],
    "Adamawa": ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
    "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"],
    "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
    "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
    "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
    "Benue": ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
    "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
    "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
    "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
    "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
    "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
    "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
    "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
    "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
    "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
    "Imo": ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
    "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kazaure", "Kiri Kasama", "Kiyawa", "Kaugama", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
    "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
    "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
    "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
    "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
    "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
    "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
    "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
    "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
    "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
    "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
    "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-West", "Akoko South-East", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
    "Osun": ["Atakunmosa East", "Atakunmosa West", "Aiyedaade", "Aiyedire", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Ife Central", "Ife East", "Ife North", "Ife South", "Egbedore", "Ejigbo", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
    "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo", "Oyo East", "Saki East", "Saki West", "Surulere"],
    "Plateau": ["Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang South", "Langtang North", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
    "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
    "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
    "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
    "Yobe": ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
    "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"]
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
