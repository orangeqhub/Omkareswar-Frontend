// Hardcoded base states and districts (all current districts for AP & Telangana)
export const BASE_STATES = ['Andhra Pradesh', 'Telangana'];

export const BASE_DISTRICTS = {
  'Andhra Pradesh': [
    'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna',
    'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam',
    'Vizianagaram', 'West Godavari', 'YSR Kadapa',
    'Alluri Sitharama Raju', 'Annamayya', 'Bapatla', 'Eluru',
    'Konaseema', 'Machilipatnam', 'Nandyal', 'Palnadu',
    'Parvathipuram Manyam', 'Tirupati', 'NTR', 'Sri Sathya Sai',
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

// ── Mandals keyed by district (base set; extensible via admin) ──
export const BASE_MANDALS = {
  // ── Andhra Pradesh ──
  'Guntur': [
    'Guntur', 'Prathipadu', 'Pedakakani', 'Kollipara', 'Tadepalle', 'Mangalagiri',
    'Thullur', 'Amaravati', 'Vemuru', 'Tenali', 'Chebrolu', 'Pedanandipadu',
    'Medikonduru', 'Duggirala', 'Kakumanu', 'Vatticherukuru', 'Phirangipuram', 'Nadendla',
  ],
  'Bapatla': [
    'Bapatla', 'Cherukupalli', 'Pittalavanipalem', 'Karlapalem', 'Amruthalur',
    'Bhattiprolu', 'Repalle', 'Nizampatnam', 'Nagaram', 'Ponnur', 'Tsundur', 'Kathivaripalem',
  ],
  'Palnadu': [
    'Narasaraopet', 'Sattenapalle', 'Pedakurapadu', 'Bollapalle', 'Vinukonda', 'Gurazala',
    'Dachepalle', 'Krosuru', 'Karempudi', 'Rentachintala', 'Ipur', 'Nekarikallu',
    'Durgi', 'Veldurthi', 'Machavaram', 'Bellamkonda', 'Piduguralla', 'Amaravadhi',
  ],
  'NTR': [
    'Vijayawada', 'Penamaluru', 'Gannavaram', 'Vuyyuru', 'Mylavaram', 'Kanchikacherla',
    'Ibrahimpatnam', 'Nandigama', 'Jaggayyapeta', 'Tiruvuru', 'Chandarlapadu',
    'Veerullapadu', 'Penuganchiprolu', 'Vatsavai', 'A.Konduru', 'Reddigudem', 'Gampalagudem',
  ],
  'Krishna': [
    'Machilipatnam', 'Gudlavalleru', 'Pedana', 'Guduru', 'Pamarru', 'Movva',
    'Challapalli', 'Avutapalli', 'Mudinepalli', 'Kaikaluru', 'Mandavalli', 'Koduru',
    'Kruthivennu', 'Ghantasala', 'Bantumilli', 'Mothavarapalle', 'Gudivada', 'Pamidimukkala',
  ],
  'Machilipatnam': [
    'Machilipatnam', 'Gudlavalleru', 'Pedana', 'Mudinepalli', 'Challapalli',
    'Ghantasala', 'Avutapalli', 'Kruthivennu', 'Mandavalli', 'Kaikaluru',
  ],
  'East Godavari': [
    'Kakinada', 'Karapa', 'Peddapuram', 'Samalkota', 'Anaparthi', 'Gandepalle',
    'Pithapuram', 'Jaggampeta', 'Rangampeta', 'Rajanagaram', 'Gokavaram',
    'Biccavolu', 'Prathipadu', 'Korukonda', 'Tallarevu', 'Kajuluru', 'Gollaprolu',
    'Draksharamam', 'Ravulapalem', 'Atreyapuram', 'Alamuru', 'Rayavaram',
    'Katrenikona', 'Tuni', 'Yeleswaram', 'Kothapalle', 'Gokavaram',
  ],
  'Konaseema': [
    'Amalapuram', 'Atreyapuram', 'Ravulapalem', 'Mamidikuduru', 'Katrenikona',
    'I.Polavaram', 'Allavaram', 'Kothapeta', 'Ambajipeta', 'Ainavilli',
    'Razole', 'Malkipuram', 'Sakhinetipalli', 'Vijayeswaram', 'Vemagiri',
  ],
  'Visakhapatnam': [
    'Bheemunipatnam', 'Padmanabham', 'Anandapuram', 'Paravada', 'Sabbavaram',
    'Pendurthi', 'Kothavalasa', 'Gajuwaka', 'Mindi', 'Gopalapatnam',
    'Maharanipeta', 'Nakkapalle', 'Devarapalle', 'Pendurti', 'Vepagunta',
  ],
  'Anakapalli': [
    'Anakapalle', 'Kotauratla', 'Narsipatnam', 'Chodavaram', 'Butchayyapeta',
    'Lankelapalem', 'Kasimkota', 'Munagapaka', 'Yelamanchili', 'Paravada',
    'S. Rayavaram', 'Makavarapalem', 'K.D.Peta', 'Achutapuram', 'Rambilli',
  ],
  'Alluri Sitharama Raju': [
    'Paderu', 'Chintapalle', 'G.Madugula', 'Munchingi Puttu', 'Pedabayalu',
    'Hukumpeta', 'Dumbriguda', 'Araku Valley', 'Ananthagiri', 'Gudem Kotha Veedhi',
    'Koyyuru', 'Rajavommangi', 'Rollapenta',
  ],
  'Vizianagaram': [
    'Vizianagaram', 'Gajapathinagaram', 'Bhogapuram', 'Denkada', 'Bondapalli',
    'Gurla', 'Jami', 'Nellimarla', 'Pusapatirega', 'Chipurupalle', 'Gantyada',
    'Komarada', 'Kurupam', 'Makkuva', 'Mentada', 'Ramabhadrapuram',
    'Srungavarapukota', 'Vepada', 'Badangi', 'Garividi', 'Kothavalasa', 'Bobili',
  ],
  'Parvathipuram Manyam': [
    'Parvathipuram', 'Balijipeta', 'Salur', 'Kurupam', 'Seethanagaram',
    'Komarada', 'Gummalakshmipuram', 'Jiyyammavalasa', 'Pachipenta', 'Makkuva',
  ],
  'Srikakulam': [
    'Srikakulam', 'Amadalavalasa', 'Etcherla', 'Gara', 'Ganguvarisigadam',
    'Hiramandalam', 'Ichapuram', 'Kotabommali', 'Kothuru', 'Laveru', 'Mandasa',
    'Narasannapeta', 'Palakonda', 'Pathapatnam', 'Polaki', 'Ponduru',
    'Ranastalam', 'Santhabommali', 'Santhakaviti', 'Saravakota', 'Seethampeta',
    'Sompeta', 'Tekkali', 'Vajrapu Kotturu', 'Veeraghattam', 'Vangara', 'Burja',
  ],
  'West Godavari': [
    'Bhimavaram', 'Tanuku', 'Palakollu', 'Narasapuram', 'Nidadavolu',
    'Tadepalligudem', 'Kovvur', 'Nallajerla', 'Unguturu', 'Veeravasaram',
    'Iragavaram', 'Penumantra', 'Poduru', 'Palacoderu', 'Mogalthur',
    'Undi', 'Ganapavaram', 'Dwarakatirumala', 'Gopalapuram', 'Chagallu', 'Devarapalli',
  ],
  'Eluru': [
    'Eluru', 'Pedavegi', 'Denduluru', 'Kamavarapukota', 'Bhimadole',
    'Jangareddygudem', 'Kukkunuru', 'Seetampeta', 'Dwarakatirumala', 'Velairpadu',
    'T. Narasapuram', 'Chatrai', 'Buttayagudem', 'Jeelugumilli', 'Lingapalem',
  ],
  'Nellore': [
    'Atmakur', 'Ananthasagaram', 'Balayapalle', 'Buchireddipalem', 'Chejerla',
    'Chillakur', 'Dagadarthi', 'Duttalur', 'Indukurpet', 'Jaladanki', 'Kavali',
    'Kodavalur', 'Kovur', 'Kaluvoya', 'Kondapuram', 'Muthukur', 'Naidupeta',
    'Nellore', 'Podalakur', 'Rapur', 'Sangam', 'T.P.Gudur', 'Udayagiri',
    'Varikuntapadu', 'Venkatagiri', 'Vidavalur', 'Vakadu', 'Vinjamur', 'Pellakur',
  ],
  'Anantapur': [
    'Anantapur', 'Atmakur', 'Beluguppa', 'Bukkarayasamudram', 'Chennekothapalle',
    'Chilamathur', 'Dharmavaram', 'Garladinne', 'Gooty', 'Gorantla', 'Gudibanda',
    'Guntakal', 'Hindupur', 'Kadiri', 'Kalyandurg', 'Kanekal', 'Kundurpi',
    'Lepakshi', 'Madakasira', 'Mudigubba', 'Nallacheruvu', 'Narpala', 'Pamidi',
    'Parigi', 'Peddapappur', 'Penukonda', 'Puttaparthi', 'Ramagiri', 'Raptadu',
    'Rayadurg', 'Roddam', 'Rolla', 'Settur', 'Singanamala', 'Somandepalli',
    'Tadimarri', 'Talupula', 'Tanakal', 'Uravakonda', 'Vajrakarur', 'Vidapanakal',
    'Yadiki', 'Yellanur', 'Obuladevaracheruvu',
  ],
  'Sri Sathya Sai': [
    'Puttaparthi', 'Penukonda', 'Madakasira', 'Hindupur', 'Lepakshi',
    'Parigi', 'Roddam', 'Gudibanda', 'Nallacheruvu', 'Amadagur', 'Chilamathur',
  ],
  'Kurnool': [
    'Kurnool', 'Adoni', 'Alur', 'Aspari', 'Atmakur', 'Bethamcherla', 'C.Belagal',
    'Chippagiri', 'Devanakonda', 'Dhone', 'Gudur', 'Holagunda', 'Kodumur',
    'Kowthalam', 'Maddikera', 'Mantralayam', 'Nandavaram', 'Orvakallu',
    'Pagidyala', 'Pandikonda', 'Panyam', 'Pedda Kadubur', 'Rudravaram',
    'S.Kondapuram', 'Sanjamala', 'Velgodu', 'Yemmiganur', 'Kosigi',
  ],
  'Nandyal': [
    'Nandyal', 'Allagadda', 'Srisailam', 'Atmakur', 'Bandiatmakur', 'Banaganapalle',
    'Bethamcherla', 'Gadivemula', 'Goppavaram', 'Jupadu Bunglow', 'Koilakuntla',
    'Mahanandi', 'Nandikotkur', 'Pamulapadu', 'Peddakothapalle', 'Rudravaram',
    'Sanjamala', 'Sirivella', 'Uyyalawada',
  ],
  'YSR Kadapa': [
    'Kadapa', 'Mylavaram', 'Pendlimarri', 'Kamalapuram', 'Chinthakommadinne',
    'Vontimitta', 'Proddatur', 'Jammalamadugu', 'Muddanur', 'Mydukur',
    'Rajampeta', 'Sidhout', 'Atlur', 'Badvel', 'Chennur', 'Duvvur', 'Gopavaram',
    'Kalasapadu', 'Khajipet', 'Koduru', 'Korlagudimadugu?', 'Nandalur', 'Obulavaripalle',
    'Porumamilla', 'Pulivendula', 'Simhadripuram', 'T. Sundupalle', 'Vallur',
    'Veeraballe', 'Yerraguntla', 'Galiveedu', 'Peddamudium', 'B.Kodur',
  ],
  'Chittoor': [
    'Chittoor', 'Palamaneru', 'Nagari', 'Puttur', 'Kuppam', 'Madanapalle',
    'Baireddipalle', 'Bangarupalem', 'Chandragiri', 'Gudipala', 'Irala',
    'Karvetinagar', 'Kothakota', 'Nindra', 'Penumuru', 'Pulicherla',
    'Renigunta', 'Srikalahasti', 'Thavanampalle', 'Vedurukuppam', 'Yadamarri',
    'Romancharla', 'Punganur', 'Sodam', 'Somala', 'Pakala', 'Narayanavanam',
    'Pichatur', 'Satyavedu', 'K.V.B.Puram', 'Varadaiahpalem',
  ],
  'Tirupati': [
    'Tirupati', 'Chandragiri', 'Srikalahasti', 'Renigunta', 'Puttur', 'Narayanavanam',
    'Vadlamudi', 'Yerpedu', 'K.V.B.Puram', 'Satyavedu', 'Nagalapuram',
    'Pichatur', 'Tiruchanur', 'Vadamalpet', 'Oakalapuram', 'Pudi', 'Ramapuram',
  ],
  'Annamayya': [
    'Rayachoti', 'Kodur', 'Rajampet', 'Vontimitta', 'Chitvel', 'Pulicherla?',
    'Obulavaripalle', 'Tirupathur', 'Peddacheppally', 'Kadiri?', 'B.Kodur',
    'Sambepalle', 'Gopavaram', 'Vayalpad', 'Gurramkonda', 'Kurabalakota', 'Yerravaripalem',
  ],
  'Prakasam': [
    'Ongole', 'Addanki', 'Chirala', 'Markapuram', 'Kandukur', 'Cumbum',
    'Giddaluru', 'Kanigiri', 'Pamur', 'Darsi', 'Yerragondapalem', 'Podili',
    'Kondapi', 'Kavali?', 'Martur', 'Tanguturu', 'Karamchedu', 'Chimakurthi',
    'Singarayakonda', 'Vetapalem', 'Sanjanala?', 'Ballikurava', 'Korisapadu',
    'Maddipadu', 'Peda Komatipalle',
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
export const MANDALS = {};
Object.keys(BASE_MANDALS).forEach(district => {
  MANDALS[district] = [...BASE_MANDALS[district]];
});

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
