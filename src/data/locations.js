// Hardcoded base states and districts (all current districts for AP & Telangana)
export const BASE_STATES = ['Andhra Pradesh', 'Telangana'];

export const BASE_DISTRICTS = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla',
    'Chittoor', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada',
    'Konaseema', 'Krishna', 'Kurnool', 'Markapuram', 'Nandyal',
    'Nellore', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Polavaram',
    'Prakasam', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
    'Vizianagaram', 'West Godavari', 'YSR Kadapa',
  ],
  Telangana: [
    'Adilabad', 'Komaram Bheem Asifabad', 'Mancherial', 'Nirmal', 'Nizamabad',
    'Jagtial', 'Peddapalli', 'Jayashankar Bhupalpally', 'Mulugu', 'Bhadradri Kothagudem',
    'Hyderabad', 'Rangareddy', 'Sangareddy', 'Medchal Malkajgiri', 'Vikarabad',
    'Nalgonda', 'Suryapet', 'Mahabubnagar', 'Wanaparthy', 'Nagarkurnool',
    'Jangaon', 'Siddipet', 'Medak', 'Kamareddy', 'Warangal',
    'Hanamkonda', 'Jayalalithaa Mahabubabad', 'Mahabubabad', 'Bhupalpally',
  ],
};

export const BASE_CITIES = [
  'Guntur', 'Vijayawada', 'Visakhapatnam', 'Ongole', 'Tenali', 'Mangalagiri',
  'Tirupati', 'Nellore', 'Kurnool', 'Anantapur', 'Chittoor', 'Rajahmundry',
  'Kakinada', 'Eluru', 'Bhimavaram', 'Tadepalligudem',
  'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Adilabad',
  'Mahbubnagar', 'Siddipet', 'Nalgonda', 'Suryapet',
];

// Cities grouped by state so the wizard can filter city/village by selected state
export const BASE_CITIES_BY_STATE = {
  'Andhra Pradesh': [
    'Guntur', 'Vijayawada', 'Visakhapatnam', 'Ongole', 'Tenali', 'Mangalagiri',
    'Tirupati', 'Nellore', 'Kurnool', 'Anantapur', 'Chittoor', 'Rajahmundry',
    'Kakinada', 'Eluru', 'Bhimavaram', 'Tadepalligudem',
  ],
  Telangana: [
    'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Adilabad',
    'Mahbubnagar', 'Siddipet', 'Nalgonda', 'Suryapet',
  ],
};

// ── Mandals keyed by district (base set; extensible via admin) ──
export const BASE_MANDALS = {
  'Alluri Sitharama Raju': [
    'Ananthagiri', 'Araku Valley', 'Chintapalle', 'Dumbriguda', 'G. Madugula',
    'Gudem Kotha Veedhi', 'Hukumpeta', 'Koyyuru', 'Munchingi Puttu', 'Paderu',
    'Peda Bayalu',
  ],
  'Anakapalli': [
    'Atchutapuram', 'Elamanchili', 'Kotauratla', 'Nakkapalle', 'Payakaraopeta',
    'Rambilli', 'Sarvasiddhi Rayavaram', 'Anakapalli', 'Butchayyapeta', 'Cheedikada',
    'Chodavaram', 'Devarapalli', 'K. Kotapadu', 'Kasimkota', 'Munagapaka',
    'Paravada', 'Sabbavaram', 'Golugonda', 'Madugula', 'Makavarapalem',
    'Narsipatnam', 'Nathavaram', 'Ravikamatham', 'Rolugunta',
  ],
  'Anantapur': [
    'Anantapuramu', 'Atmakur', 'Bukkaraya Samudram', 'Garladinne', 'Kudair',
    'Narpala', 'Peddapappur', 'Putlur', 'Raptadu', 'Singanamala',
    'Tadipatri', 'Yellanur', 'Gooty', 'Guntakal', 'Pamidi',
    'Peddavadugur', 'Uravakonda', 'Vajrakarur', 'Vidapanakal', 'Yadiki',
    'Beluguppa', 'Bommanahal', 'Brahmasamudram', 'D.Hirehal', 'Gummagatta',
    'Kalyandurg', 'Kambadur', 'Kanekal', 'Kundurpi', 'Rayadurg',
    'Settur',
  ],
  'Annamayya': [
    'Beerangi Kothakota', 'Chowdepalle', 'Kurabalakota', 'Madanapalle', 'Mulakalacheruvu',
    'Nimmanapalle', 'Peddamandyam', 'Peddathippasamudram', 'Punganur', 'Ramasamudram',
    'Thamballapalle', 'Gurramkonda', 'Kalakada', 'Kalikiri', 'Kambhamvaripalle',
    'Pileru', 'Sodam', 'Somala', 'Vayalpad', 'Chinnamandyam',
    'Galiveedu', 'Lakkireddipalli', 'Ramapuram', 'Rayachoti', 'Sambepalli',
  ],
  'Bapatla': [
    'Bapatla', 'Karlapalem', 'Martur', 'Parchur', 'Pittalavanipalem',
    'Yeddanapudi', 'Chinaganjam', 'Chirala', 'Inkollu', 'Karamchedu',
    'Vetapalem', 'Amruthalur', 'Bhattiprolu', 'Cherukupalle', 'Kolluru',
    'Nagaram', 'Nizampatnam', 'Repalle', 'Tsundur', 'Vemuru',
  ],
  'Chittoor': [
    'Bangarupalem', 'Chittoor', 'Chittoor Urban', 'Gangadhara Nellore', 'Gudipala',
    'Irala', 'Penumuru', 'Pulicherla', 'Puthalapattu', 'Rompicherla',
    'Sri Rangaraja Puram', 'Thavanampalle', 'Vedurukuppam', 'Yadamarri', 'Kuppam',
    'Ramakuppam', 'Santhipuram', 'Gudipalle', 'Nagari', 'Nindra',
    'Palasamudram', 'Vijayapuram', 'Karvetinagar', 'Baireddipalle', 'Gangavaram',
    'Palamaner', 'Peddapanjani', 'Venkatagirikota',
  ],
  'East Godavari': [
    'Chagallu', 'Devarapalle', 'Gopalapuram', 'Kovvur', 'Nallajerla',
    'Nidadavole', 'Peravali', 'Tallapudi', 'Undrajavaram', 'Anaparthi',
    'Biccavolu', 'Gokavaram', 'Kadiam', 'Kapileswarapuram', 'Korukonda',
    'Mandapeta', 'Rajahmundry Urban', 'Rajahmundry Rural', 'Rajanagaram', 'Rangampeta',
    'Rayavaram', 'Seethanagaram',
  ],
  'Eluru': [
    'Bhimadole', 'Denduluru', 'Eluru', 'Kaikalur', 'Kalidindi',
    'Mandavalli', 'Mudinepalle', 'Nidamarru', 'Pedapadu', 'Pedavegi',
    'Unguturu', 'Buttayagudem', 'Dwaraka Tirumala', 'Jangareddygudem', 'Jeelugu Milli',
    'Kamavarapukota', 'Koyyalagudem', 'Kukunoor', 'Polavaram', 'T. Narasapuram',
    'Velairpadu', 'Agiripalli', 'Chatrai', 'Chintalapudi', 'Lingapalem',
    'Musunuru', 'Nuzvid',
  ],
  'Guntur': [
    'Guntur East', 'Guntur West', 'Medikonduru', 'Pedakakani', 'Pedanandipadu',
    'Phirangipuram', 'Prathipadu', 'Tadikonda', 'Thullur', 'Vatticherukuru',
    'Chebrolu', 'Duggirala', 'Kakumanu', 'Kollipara', 'Mangalagiri',
    'Ponnur', 'Tadepalli', 'Tenali',
  ],
  'Kakinada': [
    'Gollaprolu', 'Kajuluru', 'Kakinada Rural', 'Kakinada Urban', 'Karapa',
    'Kothapalle', 'Pedapudi', 'Pithapuram', 'Thallarevu', 'Gandepalle',
    'Jaggampeta', 'Kirlampudi', 'Kotananduru', 'Peddapuram', 'Prathipadu',
    'Rowthulapudi', 'Samalkota', 'Sankhavaram', 'Thondangi', 'Tuni',
    'Yeleswaram',
  ],
  'Konaseema': [
    'Allavaram', 'Amalapuram', 'I. Polavaram', 'Katrenikona', 'Malikipuram',
    'Mamidikuduru', 'Mummidivaram', 'Razole', 'Sakhinetipalle', 'Uppalaguptam',
    'Ainavilli', 'Alamuru', 'Ambajipeta', 'Atreyapuram', 'Kothapeta',
    'P. Gannavaram', 'Ravulapalem', 'K. Gangavaram', 'Ramachandrapuram',
  ],
  'Krishna': [
    'Bapulapadu', 'Gannavaram', 'Gudivada', 'Gudlavalleru', 'Nandivada',
    'Pedaparupudi', 'Unguturu', 'Avanigadda', 'Bantumilli', 'Challapalli',
    'Ghantasala', 'Guduru', 'Koduru', 'Kruthivennu', 'Machilipatnam',
    'Mopidevi', 'Nagayalanka', 'Pedana', 'Kankipadu', 'Movva',
    'Pamarru', 'Pamidimukkala', 'Penamaluru', 'Thotlavalluru', 'Vuyyuru',
  ],
  'Kurnool': [
    'Adoni Urban', 'Adoni Rural', 'Gonegandla', 'Holagunda', 'Kosigi',
    'Kowthalam', 'Mantralayam', 'Nandavaram', 'Pedda Kadubur', 'Yemmiganur',
    'C.Belagal', 'Gudur', 'Kallur', 'Kodumur', 'Kurnool Urban',
    'Kurnool Rural', 'Orvakal', 'Veldurthi', 'Alur', 'Aspari',
    'Chippagiri', 'Devanakonda', 'Halaharvi', 'Krishnagiri', 'Maddikera East',
    'Pattikonda', 'Tuggali',
  ],
  'Markapuram': [
    'Chandra Sekhara Puram', 'Hanumanthuni Padu', 'Kanigiri', 'Pamur', 'Pedacherlo Palle',
    'Veligandla', 'Ardhaveedu', 'Bestawaripeta', 'Cumbum', 'Dornala',
    'Giddalur', 'Konakanamitla', 'Komarolu', 'Markapuram', 'Peda Araveedu',
    'Pullalacheruvu', 'Podili', 'Racherla', 'Tarlupadu', 'Tripuranthakam',
    'Yerragondapalem',
  ],
  'Nandyal': [
    'Atmakur', 'Bandi Atmakur', 'Jupadu Bungalow', 'Kothapalle', 'Midthuru',
    'Nandikotkur', 'Pagidyala', 'Pamulapadu', 'Srisailam', 'Velgodu',
    'Banaganapalle', 'Koilkuntla', 'Kolimigundla', 'Owk', 'Sanjamala',
    'Bethamcherla', 'Dhone', 'Peapally', 'Allagadda', 'Chagalamarri',
    'Dornipadu', 'Gadivemula', 'Gospadu', 'Mahanandi', 'Nandyal Rural',
    'Nandyal Urban', 'Panyam', 'Rudravaram', 'Sirivella', 'Uyyalawada',
  ],
  'Nellore': [
    'Ananthasagaram', 'Anumasamudrampeta', 'Atmakur', 'Chejerla', 'Kaluvoya',
    'Marripadu', 'Sangam', 'Sitarampuramu', 'Udayagiri', 'Gudur',
    'Chillakur', 'Kota', 'Allur', 'Bogolu', 'Dagadarthi',
    'Duttaluru', 'Jaladanki', 'Kaligiri', 'Kavali', 'Kodavaluru',
    'Vidavaluru', 'Vinjamuru', 'Buchireddypalem', 'Indukurpet', 'Kovur',
    'Manubolu', 'Muttukuru', 'Nellore Urban', 'Nellore Rural', 'Podalakuru',
    'Rapuru', 'Saidapuramu', 'Thotapalligudur', 'Venkatachalam',
  ],
  'NTR': [
    'Chandarlapadu', 'Jaggayyapeta', 'Kanchikacherla', 'Nandigama', 'Penuganchiprolu',
    'Vatsavai', 'Veerullapadu', 'A. Konduru', 'Gampalagudem', 'Reddigudem',
    'Tiruvuru', 'Vissannapeta', 'G.Konduru', 'Ibrahimpatnam', 'Mylavaram',
    'Vijayawada Rural', 'Vijayawada North', 'Vijayawada Central', 'Vijayawada East', 'Vijayawada West',
  ],
  'Palnadu': [
    'Dachepalle', 'Durgi', 'Gurazala', 'Karempudi', 'Macherla',
    'Machavaram', 'Piduguralla', 'Rentachintala', 'Veldurthi', 'Bollapalle',
    'Chilakaluripet', 'Edlapadu', 'Ipuru', 'Nadendla', 'Narasaraopet',
    'Nuzendla', 'Rompicherla', 'Savalyapuram', 'Vinukonda', 'Amaravathi',
    'Atchampet', 'Bellamkonda', 'Krosuru', 'Muppalla', 'Nekarikallu',
    'Pedakurapadu', 'Rajupalem', 'Sattenapalle',
  ],
  'Parvathipuram Manyam': [
    'Bhamini', 'Gummalakshmipuram', 'Jiyyammavalasa', 'Kurupam', 'Palakonda',
    'Seethampeta', 'Veeraghattam', 'Balijipeta', 'Garugubilli', 'Komarada',
    'Makkuva', 'Pachipenta', 'Parvathipuram', 'Salur', 'Seethanagaram',
  ],
  'Polavaram': [
    'Chintur', 'Etapaka', 'Kunavaram', 'Vararamachandrapuram', 'Addateegala',
    'Devipatnam', 'Gangavaram', 'Gurthedu', 'Maredumilli', 'Rajavommangi',
    'Rampachodavaram', 'Y. Ramavaram',
  ],
  'Prakasam': [
    'Korisapadu', 'J. Panguluru', 'Addanki', 'Ballikurava', 'Santhamaguluru',
    'Mundlamuru Ongole', 'Thallur', 'Darsi', 'Donakonda Kanigiri', 'Kurichedu',
    'Gudluru', 'Kandukuru', 'Lingasamudram', 'Ulavapadu', 'Marripudi',
    'Ponnaluru', 'Voletivaripalem', 'Chimakurthi', 'Kondapi', 'Kotha Patnam',
    'Maddipadu', 'Naguluppalapadu', 'Ongole Urban', 'Ongole Rural', 'Santhanuthala Padu',
    'Singarayakonda', 'Tangutur', 'Zarugumilli',
  ],
  'Sri Sathya Sai': [
    'Bathalapalle', 'Chennekothapalle', 'Dharmavaram', 'Kanaganapalle', 'Mudigubba',
    'Ramagiri', 'Tadimarri', 'Gandlapenta', 'Kadiri', 'Lepakshi',
    'Nallacheruvu', 'Nambulapulakunta', 'Tanakal', 'Agali', 'Amarapuram',
    'Gudibanda', 'Madakasira', 'Rolla', 'Chilamathur', 'Gorantla',
    'Hindupur', 'Parigi', 'Penukonda', 'Roddam', 'Somandepalle',
    'Talupula', 'Amadagur', 'Bukkapatnam', 'Kothacheruvu', 'Nallamada',
    'Obuladevaracheruvu', 'Puttaparthi',
  ],
  'Srikakulam': [
    'Ichchapuram', 'Kanchili', 'Kaviti', 'Mandasa', 'Palasa',
    'Sompeta', 'Vajrapukothuru', 'Amadalavalasa', 'Burja', 'Etcherla',
    'Ganguvarisigadam', 'Gara', 'Jalumuru', 'Laveru', 'Narasannapeta',
    'Polaki', 'Ponduru', 'Ranastalam', 'Sarubujjili', 'Srikakulam',
    'Hiramandalam', 'Kotabommali', 'Kothuru', 'Lakshminarsupeta', 'Meliaputti',
    'Nandigam', 'Pathapatnam', 'Santhabommali', 'Saravakota', 'Tekkali',
  ],
  'Tirupati': [
    'Balayapalle', 'Dakkili', 'K. V. B. Puram', 'Nagalapuram', 'Narayanavanam',
    'Pichatur', 'Renigunta', 'Srikalahasti', 'Thottambedu', 'Venkatagiri',
    'Yerpedu', 'Buchinaidu Kandriga', 'Chittamur', 'Doravarisatram', 'Naidupeta',
    'Ozili', 'Pellakur', 'Satyavedu', 'Sullurpeta', 'Tada',
    'Vakadu', 'Varadaiahpalem', 'Chandragiri', 'Chinnagottigallu', 'Chitvel',
    'Kodur', 'Obulavaripalle', 'Pakala', 'Penagalur', 'Pullampeta',
    'Puttur', 'Ramachandrapuram', 'Tirupati Rural', 'Tirupati Urban', 'Vadamalapeta',
    'Yerravaripalem',
  ],
  'Visakhapatnam': [
    'Anandapuram', 'Bheemunipatnam', 'Padmanabham', 'Seethammadhara', 'Visakhapatnam Rural',
    'Gajuwaka', 'Gopalapatnam', 'Maharanipeta', 'Mulagada', 'Pedagantyada',
    'Pendurthi',
  ],
  'Vizianagaram': [
    'Badangi', 'Bobbili', 'Dattirajeru', 'Gajapathinagaram', 'Mentada',
    'Ramabhadrapuram', 'Therlam', 'Cheepurupalle', 'Garividi', 'Gurla',
    'Merakamudidam', 'Rajam', 'Regidi Amadalavalasa', 'Santhakaviti', 'Vangara',
    'Bhogapuram', 'Bondapalle', 'Denkada', 'Gantyada', 'Jami',
    'Kothavalasa', 'Lakkavarapukota', 'Nellimarla', 'Pusapatirega', 'Srungavarapukota',
    'Vepada', 'Vizianagaram',
  ],
  'West Godavari': [
    'Akividu', 'Bhimavaram', 'Kalla', 'Palacoderu', 'Undi',
    'Veeravasaram', 'Achanta', 'Mogalthur', 'Palakollu', 'Penugonda',
    'Penumantra', 'Poduru', 'Yelamanchili', 'Attili', 'Ganapavaram',
    'Iragavaram', 'Pentapadu', 'Tadepalligudem', 'Tanuku',
  ],
  'YSR Kadapa': [
    'Atlur', 'B. Kodur', 'Badvel', 'Brahmamgarimattam', 'Chapad',
    'Duvvur', 'Gopavaram', 'Kalasapadu', 'Khajipet', 'Porumamilla',
    'S.Mydukur', 'Sri Avadhutha Kasinayana', 'Jammalamadugu', 'Kondapuram', 'Muddanur',
    'Mylavaram', 'Peddamudium', 'Proddatur', 'Rajupalem', 'Chennur',
    'Chinthakommadinne', 'Kadapa', 'Kamalapuram', 'Pendlimarri', 'Sidhout',
    'Vallur', 'Vontimitta', 'Yerraguntla', 'Chakrayapet', 'Lingala',
    'Pulivendla', 'Simhadripuram', 'Thondur', 'Veerapunayunipalle', 'Vempalle',
    'Vemula', 'Nandalur', 'Rajampet', 'T. Sundupalle', 'Veeraballi',
  ],
// ── Telangana ──
  'Hyderabad': [
    'Secunderabad', 'Musheerabad', 'Bahadurpura', 'Bandlaguda', 'Charminar',
    'Golconda', 'Himayathnagar', 'Kapra', 'Khairatabad', 'Maredpally',
    'Mehdipatnam', 'Nampally', 'Qutubullapur', 'Rajendranagar', 'Saidabad',
    'Shaikpet', 'Shamshabad', 'Tirumalagiri', 'Ameerpet', 'Dabeerpura',
  ],
  'Rangareddy': [
    'Rajendranagar', 'Shamshabad', 'Ibrahimpatnam', 'Hayathnagar', 'Saroornagar',
    'Keesara', 'Shankarpally', 'Moinabad', 'Chevella', 'Farooqnagar',
    'Shadnagar', 'Tandur', 'Pargi', 'K.V.Rangareddy', 'Vicarabad Road',
  ],
  'Sangareddy': [
    'Sangareddy', 'Zahirabad', 'Narayankhed', 'Andole', 'Jharasangam',
    'Patancheru', 'Ramachandrapuram', 'Sadasivpet', 'Mogudampally?',
  ],
  'Medchal Malkajgiri': [
    'Medchal', 'Malkajgiri', 'Kutbullapur', 'Alwal', 'Keesara', 'Ghatkesar',
    'Uppal', 'Kapra', 'Shameerpet', 'Muthangi',
  ],
  'Vikarabad': [
    'Vikarabad', 'Pargi', 'Tandur', 'Parigi', 'Dharur', 'Kodangal',
    'Bantvaram', 'Marpalle', 'Bommaraspet', 'Kulkacherla',
  ],
  'Nalgonda': [
    'Nalgonda', 'Miryalaguda', 'Suryapet', 'Kodad', 'Huzurnagar', 'Devarakonda',
    'Bhongir', 'Chityala', 'Nakrekal', 'Munugode', 'Pedda Adiserla', 'Shaligouraram',
    'Yadagirigutta', 'Thungathurthy', 'Gurrampode',
  ],
  'Suryapet': [
    'Suryapet', 'Kodad', 'Huzurnagar', 'Thungathurthy', 'Mellachervu',
    'Chilkur', 'Nuthankal', 'Atmakur', 'Jajireddigudem',
  ],
  'Mahabubnagar': [
    'Mahabubnagar', 'Jadcherla', 'Shadnagar', 'Kothakota', 'Hanwada',
    'Midjil', 'Balanagar', 'Konark?', 'Narayanpet', 'Devarkadra',
  ],
  'Wanaparthy': [
    'Wanaparthy', 'Atmakur', 'Gopalpeta', 'Amarchinta', 'Kothakota?',
  ],
  'Nagarkurnool': [
    'Nagarkurnool', 'Kodangal', 'Wanaparthy?', 'Kolhapur', 'Kalwakurthy',
    'Achampet', 'Amrabad', 'Thimmajipet', 'Tadoor',
  ],
  'Medak': [
    'Medak', 'Siddipet', 'Narsapur', 'Gajwel', 'Mirdoddi', 'Telkapalli',
    'Chegunta', 'Kowdipally', 'Papannapet', 'Ramayampet', 'Sangaipet',
  ],
  'Siddipet': [
    'Siddipet', 'Gajwel', 'Dubbaka', 'Mirdoddi', 'Nangnoor', 'Kondapak',
    'Mulug', 'Komuravelli', 'Chinna Kodur', 'Jagdevpur',
  ],
  'Nizamabad': [
    'Nizamabad', 'Armoor', 'Banswada', 'Bodhan', 'Kamareddy', 'Madnoor',
    'Yellareddy', 'Bichkunda', 'Dichpally', 'Indalwai', 'Mendora', 'Kammarpalle',
  ],
  'Adilabad': [
    'Adilabad', 'Utnoor', 'Nirmal', 'Bhainsa', 'Boath', 'Inderavelly',
    'Lokeswaram', 'Mudhole', 'Tamsi', 'Asifabad?',
  ],
  'Komaram Bheem Asifabad': [
    'Asifabad', 'Sirpur', 'Kaghaznagar', 'Bela', 'Rebbena', 'Wankidi',
    'Kagaznagar', 'Kerameri', 'Tiryani',
  ],
  'Mancherial': [
    'Mancherial', 'Bellampalli', 'Mandamarri', 'Jannaram', 'Kotapalli',
    'Vemanpalli', 'Nennel', 'Jaipuram?',
  ],
  'Nirmal': [
    'Nirmal', 'Bhainsa', 'Khanapur', 'Boath', 'Dilawarpur', 'Kuntala',
    'Mudhole', 'Sarangapur', 'Tanoor', 'Narsapur',
  ],
  'Jagtial': [
    'Jagtial', 'Koratla', 'Metpally', 'Mallapur', 'Sarangapur', 'Ibrahimpatnam',
    'Kathlapur', 'Dhullapally',
  ],
  'Peddapalli': [
    'Peddapalli', 'Karimnagar?', 'Sultanabad', 'Mutharam', 'Chandurthi', 'Odela',
    'Manthani', 'Elgaid', 'Sulthanabad',
  ],
  'Jayashankar Bhupalpally': [
    'Bhupalpally', 'Muthyaram?', 'Mulug?', 'Regonda', 'Mahabubabad?', 'Ghanpur',
    'Chityal', 'Peddavangara',
  ],
  'Mulugu': [
    'Mulugu', 'Eturnagaram', 'Mangapet', 'Tadvai', 'Venkatapur',
  ],
  'Bhadradri Kothagudem': [
    'Kothagudem', 'Palawancha', 'Bhadrachalam', 'Yellandu', 'Dummugudem',
    'Manuguru', 'Aswapuram', 'Pinapaka', 'Julurpad',
  ],
  'Warangal': [
    'Warangal', 'Hanamkonda', 'Kazipet', 'Narsampet', 'Parkal', 'Jangaon?',
    'Dharmasagar', 'Geethanandapuram', 'Mulugu?', 'Wardhannapet',
  ],
  'Hanamkonda': [
    'Hanamkonda', 'Warangal', 'Kazipet', 'Dharmasagar', 'Elkathurthy',
    'Radhikal?', 'Parkal', 'Sangam',
  ],
  'Mahabubabad': [
    'Mahabubabad', 'Gudur', 'Narsimhulapet', 'Thorrur', 'Danthalapalle',
    'Kesamudram', 'Kurvi', 'Bayyaram',
  ],
  'Jangaon': [
    'Jangaon', 'Narmetta', 'Chennoor?', 'Raghunathapalle', 'Zaffergadh',
    'Ghanpur', 'Lingala-ghanpur', 'Devaruppla', 'Sangam',
  ],
  'Kamareddy': [
    'Kamareddy', 'Yellareddy', 'Banswada', 'Madnoor', 'Machareddy',
    'Nizamsagar', 'Tadwai', 'Gandhari', 'Nagireddypet',
  ],
  'Khammam': [
    'Khammam', 'Sathupalli', 'Pala Vancha', 'Wyra', 'Tirumalayapalem',
    'Kothagudem', 'Kusumanchi', 'Chinthakani', 'Bonde?', 'Pennuballi',
    'Enkuru', 'Konijerla', 'Kallur', 'Nelakondapalli',
  ],
  'Karimnagar': [
    'Karimnagar', 'Karimnagar Rural', 'Choppadandi', 'Jagtial?', 'Ramadugu',
    'Manakondur', 'Huzurabad', 'Gangadhara', 'Boinpalle?', 'Chigurumamidi',
    'Thimmapur', 'Vedhi?', 'Ellanthakunta', 'Konaraopet', 'Keshavapatnam',
  ],
};

// Mutable runtime arrays (extended by custom locations below)
export const STATES = [...BASE_STATES];
export const DISTRICTS = {};
BASE_DISTRICTS['Andhra Pradesh'].forEach(d => {
  if (!DISTRICTS['Andhra Pradesh']) DISTRICTS['Andhra Pradesh'] = [];
  DISTRICTS['Andhra Pradesh'].push(d);
});
BASE_DISTRICTS['Telangana'].forEach(d => {
  if (!DISTRICTS['Telangana']) DISTRICTS['Telangana'] = [];
  DISTRICTS['Telangana'].push(d);
});
export const CITIES = [...BASE_CITIES];
export const CITIES_BY_STATE = {
  'Andhra Pradesh': [...BASE_CITIES_BY_STATE['Andhra Pradesh']],
  Telangana: [...BASE_CITIES_BY_STATE['Telangana']],
};
export const MANDALS = {};
Object.keys(BASE_MANDALS).forEach(district => {
  MANDALS[district] = [...BASE_MANDALS[district]];
});

// ── Map a city back to its parent state ("" if unknown/custom) ─────────
export function getStateForCity(city) {
  if (!city) return '';
  for (const state of Object.keys(CITIES_BY_STATE)) {
    if (CITIES_BY_STATE[state].includes(city)) return state;
  }
  return '';
}

// ── Load custom locations from localStorage (sync fallback) ──────────
function loadCustomFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('omkar_custom_locations');
    if (!raw) return;
    const custom = JSON.parse(raw);
    if (custom.states) {
      custom.states.forEach(s => { if (!STATES.includes(s)) STATES.push(s); });
    }
    if (custom.districts) {
      Object.keys(custom.districts).forEach(state => {
        if (!DISTRICTS[state]) DISTRICTS[state] = [];
        custom.districts[state].forEach(d => {
          if (!DISTRICTS[state].includes(d)) DISTRICTS[state].push(d);
        });
      });
    }
    if (custom.cities) {
      custom.cities.forEach(c => { if (!CITIES.includes(c)) CITIES.push(c); });
    }
    if (custom.mandals) {
      Object.keys(custom.mandals).forEach(district => {
        if (!MANDALS[district]) MANDALS[district] = [];
        custom.mandals[district].forEach(m => {
          if (!MANDALS[district].includes(m)) MANDALS[district].push(m);
        });
      });
    }
  } catch (e) {
    console.error('Failed to load custom locations from storage', e);
  }
}

// ── Load custom locations from backend API (async, non-blocking) ─────
async function loadCustomFromAPI() {
  if (typeof window === 'undefined') return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const res = await fetch(`${apiUrl}/admin/settings/public`);
    if (!res.ok) return;
    const json = await res.json();
    const data = json?.data ?? json;
    const custom = data?.customLocations;
    if (!custom) return;

    if (custom.states) {
      custom.states.forEach(s => { if (!STATES.includes(s)) STATES.push(s); });
    }
    if (custom.districts) {
      Object.keys(custom.districts).forEach(state => {
        if (!DISTRICTS[state]) DISTRICTS[state] = [];
        custom.districts[state].forEach(d => {
          if (!DISTRICTS[state].includes(d)) DISTRICTS[state].push(d);
        });
      });
    }
    if (custom.cities) {
      custom.cities.forEach(c => { if (!CITIES.includes(c)) CITIES.push(c); });
    }
    if (custom.mandals) {
      Object.keys(custom.mandals).forEach(district => {
        if (!MANDALS[district]) MANDALS[district] = [];
        custom.mandals[district].forEach(m => {
          if (!MANDALS[district].includes(m)) MANDALS[district].push(m);
        });
      });
    }

    // Also sync to localStorage so subsequent loads are instant
    localStorage.setItem('omkar_custom_locations', JSON.stringify({
      states: custom.states || [],
      districts: custom.districts || {},
      cities: custom.cities || [],
      mandals: custom.mandals || {},
    }));
  } catch (e) {
    // Silent fail – localStorage fallback already loaded
  }
}

// Run on module load
loadCustomFromStorage();
loadCustomFromAPI();

// ── Add a custom location (writes to both in-memory arrays + localStorage) ──
export function addCustomLocation(type, value, extraState) {
  if (typeof window === 'undefined') return;
  try {
    const custom = JSON.parse(
      localStorage.getItem('omkar_custom_locations') ||
      '{"states":[],"districts":{},"cities":[],"mandals":{}}'
    );

    if (type === 'state') {
      if (!STATES.includes(value)) {
        STATES.push(value);
        custom.states = custom.states || [];
        custom.states.push(value);
      }
    } else if (type === 'district') {
      const stateKey = extraState || 'Andhra Pradesh';
      if (!DISTRICTS[stateKey]) DISTRICTS[stateKey] = [];
      if (!DISTRICTS[stateKey].includes(value)) {
        DISTRICTS[stateKey].push(value);
        if (!custom.districts[stateKey]) custom.districts[stateKey] = [];
        custom.districts[stateKey].push(value);
      }
    } else if (type === 'city') {
      if (!CITIES.includes(value)) {
        CITIES.push(value);
        custom.cities = custom.cities || [];
        custom.cities.push(value);
      }
    } else if (type === 'mandal') {
      const districtKey = extraState || 'Guntur';
      if (!MANDALS[districtKey]) MANDALS[districtKey] = [];
      if (!MANDALS[districtKey].includes(value)) {
        MANDALS[districtKey].push(value);
        custom.mandals = custom.mandals || {};
        custom.mandals[districtKey] = custom.mandals[districtKey] || [];
        custom.mandals[districtKey].push(value);
      }
    }

    localStorage.setItem('omkar_custom_locations', JSON.stringify(custom));
  } catch (e) {
    console.error('Failed to save custom location', e);
  }
}

// ── Remove a custom location ─────────────────────────────────────────
export function removeCustomLocation(type, value, extraState) {
  if (typeof window === 'undefined') return;
  try {
    const custom = JSON.parse(
      localStorage.getItem('omkar_custom_locations') ||
      '{"states":[],"districts":{},"cities":[],"mandals":{}}'
    );

    if (type === 'state') {
      const idx = STATES.indexOf(value);
      if (idx > -1) STATES.splice(idx, 1);
      custom.states = (custom.states || []).filter(s => s !== value);
    } else if (type === 'district') {
      const stateKey = extraState || 'Andhra Pradesh';
      if (DISTRICTS[stateKey]) {
        const idx = DISTRICTS[stateKey].indexOf(value);
        if (idx > -1) DISTRICTS[stateKey].splice(idx, 1);
      }
      if (custom.districts[stateKey]) {
        custom.districts[stateKey] = custom.districts[stateKey].filter(d => d !== value);
      }
    } else if (type === 'city') {
      const idx = CITIES.indexOf(value);
      if (idx > -1) CITIES.splice(idx, 1);
      custom.cities = (custom.cities || []).filter(c => c !== value);
    } else if (type === 'mandal') {
      const districtKey = extraState || 'Guntur';
      if (MANDALS[districtKey]) {
        const idx = MANDALS[districtKey].indexOf(value);
        if (idx > -1) MANDALS[districtKey].splice(idx, 1);
      }
      if (custom.mandals?.[districtKey]) {
        custom.mandals[districtKey] = custom.mandals[districtKey].filter(m => m !== value);
      }
    }

    localStorage.setItem('omkar_custom_locations', JSON.stringify(custom));
  } catch (e) {
    console.error('Failed to remove custom location', e);
  }
}

// ── Check if a location is a base (hardcoded) entry ──────────────────
export function isBaseLocation(type, value, extraState) {
  if (type === 'state') return BASE_STATES.includes(value);
  if (type === 'district') return (BASE_DISTRICTS[extraState] || []).includes(value);
  if (type === 'city') return BASE_CITIES.includes(value);
  if (type === 'mandal') return (BASE_MANDALS[extraState] || []).includes(value);
  return false;
}

export const POPULAR_LOCATIONS = [
  { city: 'Guntur', count: 42, image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=60' },
  { city: 'Vijayawada', count: 61, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=60' },
  { city: 'Hyderabad', count: 88, image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=60' },
  { city: 'Mangalagiri', count: 23, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=60' },
  { city: 'Tenali', count: 17, image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=60' },
  { city: 'Ongole', count: 12, image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=600&q=60' },
];
