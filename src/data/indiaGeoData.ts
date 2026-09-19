// Comprehensive India Geographic Intelligence Dataset for AgroMind AI
// Covers All 28 States & 8 Union Territories with Districts, Cities, and Talukas / Villages

export interface StateDistrictMapping {
  state: string;
  districts: string[];
}

export const INDIA_STATES_AND_DISTRICTS: StateDistrictMapping[] = [
  {
    state: 'Gujarat',
    districts: [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
      'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
      'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
      'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
      'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
      'Tapi', 'Vadodara', 'Valsad'
    ]
  },
  {
    state: 'Maharashtra',
    districts: [
      'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar (Aurangabad)',
      'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
      'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
      'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik',
      'Dharashiv (Osmanabad)', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri',
      'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ]
  },
  {
    state: 'Rajasthan',
    districts: [
      'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer',
      'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh',
      'Churu', 'Dausa', 'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu',
      'Dungarpur', 'Sri Ganganagar', 'Gangapur City', 'Hanumangarh', 'Jaipur',
      'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur',
      'Jodhpur Rural', 'Karauli', 'Kekri', 'Khairthal-Tijara', 'Kota',
      'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 'Pali', 'Phalodi', 'Pratapgarh',
      'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura', 'Sikar',
      'Sirohi', 'Tonk', 'Udaipur'
    ]
  },
  {
    state: 'Madhya Pradesh',
    districts: [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
      'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara',
      'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda',
      'Narmadapuram (Hoshangabad)', 'Indore', 'Jabalpur', 'Jhabua', 'Katni',
      'Khandwa', 'Khargone', 'Maihar', 'Mandla', 'Mandsaur', 'Mauganj', 'Morena',
      'Narsinghpur', 'Neemuch', 'Niwari', 'Pandhurna', 'Panna', 'Raisen', 'Rajgarh',
      'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur',
      'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
    ]
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya',
      'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
      'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli',
      'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad',
      'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur',
      'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
      'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar',
      'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri',
      'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit',
      'Pratapgarh', 'Prayagraj (Allahabad)', 'Raebareli', 'Rampur', 'Saharanpur',
      'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti',
      'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
    ]
  },
  {
    state: 'Punjab',
    districts: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka',
      'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana',
      'Malerkotla', 'Mansa', 'Moga', 'Mohali (SAS Nagar)', 'Muktsar', 'Pathankot',
      'Patiala', 'Rupnagar', 'Sangrur', 'SBS Nagar (Nawanshahr)', 'Tarn Taran'
    ]
  },
  {
    state: 'Haryana',
    districts: [
      'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram',
      'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh',
      'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
      'Sonipat', 'Yamunanagar'
    ]
  },
  {
    state: 'Karnataka',
    districts: [
      'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
      'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga',
      'Dakshina Kannada (Mangaluru)', 'Davanagere', 'Dharwad (Hubballi)', 'Gadag',
      'Hassan', 'Haveri', 'Kalaburagi (Gulbarga)', 'Kodagu', 'Kolar', 'Koppal',
      'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru',
      'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura (Bijapur)', 'Yadgir'
    ]
  },
  {
    state: 'Tamil Nadu',
    districts: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
      'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
      'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
      'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem',
      'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli',
      'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai',
      'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
    ]
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
      'Chittoor', 'East Godavari (Rajamahendravaram)', 'Eluru', 'Guntur', 'Kakinada',
      'Dr. B.R. Ambedkar Konaseema', 'Krishna (Machilipatnam)', 'Kurnool', 'Nandyal',
      'NTR (Vijayawada)', 'Palnadu (Narasaraopet)', 'Parvathipuram Manyam', 'Prakasam (Ongole)',
      'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati',
      'Visakhapatnam', 'Vizianagaram', 'West Godavari (Bhimavaram)', 'YSR Kadapa'
    ]
  },
  {
    state: 'Telangana',
    districts: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial',
      'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy',
      'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar',
      'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool',
      'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla',
      'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy',
      'Warangal', 'Yadadri Bhuvanagiri'
    ]
  },
  {
    state: 'Bihar',
    districts: [
      'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur (Arrah)',
      'Buxar', 'Darbhanga', 'East Champaran (Motihari)', 'Gaya', 'Gopalganj', 'Jamui',
      'Jehanabad', 'Kaimur (Bhabua)', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai',
      'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda (Bihar Sharif)',
      'Nawada', 'Patna', 'Purnia', 'Rohtas (Sasaram)', 'Saharsa', 'Samastipur',
      'Saran (Chhapra)', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul',
      'Vaishali (Hajipur)', 'West Champaran (Bettiah)'
    ]
  },
  {
    state: 'West Bengal',
    districts: [
      'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
      'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong',
      'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas',
      'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur',
      'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
    ]
  },
  {
    state: 'Odisha',
    districts: [
      'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack',
      'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam (Brahmapur)', 'Jagatsinghpur',
      'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar',
      'Khordha (Bhubaneswar)', 'Koraput', 'Malkangiri', 'Mayurbhanj (Baripada)',
      'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur',
      'Subarnapur (Sonepur)', 'Sundargarh (Rourkela)'
    ]
  },
  {
    state: 'Kerala',
    districts: [
      'Alappuzha', 'Ernakulam (Kochi)', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam',
      'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta',
      'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ]
  },
  {
    state: 'Assam',
    districts: [
      'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar (Silchar)', 'Charaideo',
      'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao',
      'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup Metropolitan (Guwahati)',
      'Kamrup Rural', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur',
      'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur (Tezpur)',
      'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
    ]
  },
  {
    state: 'Jharkhand',
    districts: [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum (Jamshedpur)',
      'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti',
      'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu (Medininagar)', 'Ramgarh',
      'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum (Chaibasa)'
    ]
  },
  {
    state: 'Chhattisgarh',
    districts: [
      'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar (Jagdalpur)', 'Bemetara',
      'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg (Bhilai)', 'Gariaband',
      'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham (Kawardha)',
      'Kanker', 'Khairagarh', 'Kondagaon', 'Korba', 'Korea', 'Mahasamund',
      'Manendragarh', 'Mohla-Manpur', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur',
      'Rajnandgaon', 'Sakti', 'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja (Ambikapur)'
    ]
  },
  {
    state: 'Uttarakhand',
    districts: [
      'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar',
      'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal',
      'Udham Singh Nagar (Rudrapur)', 'Uttarkashi'
    ]
  },
  {
    state: 'Himachal Pradesh',
    districts: [
      'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra (Dharamshala)', 'Kinnaur',
      'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'
    ]
  },
  {
    state: 'Jammu and Kashmir',
    districts: [
      'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu',
      'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri',
      'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
    ]
  },
  {
    state: 'Goa',
    districts: ['North Goa (Panaji)', 'South Goa (Margao)']
  },
  {
    state: 'Delhi (NCT)',
    districts: [
      'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
      'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi',
      'South West Delhi', 'West Delhi'
    ]
  },
  {
    state: 'Tripura',
    districts: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura (Agartala)']
  },
  {
    state: 'Meghalaya',
    districts: [
      'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills (Shillong)',
      'Eastern West Khasi Hills', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills',
      'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills (Tura)',
      'West Jaintia Hills', 'West Khasi Hills'
    ]
  },
  {
    state: 'Manipur',
    districts: [
      'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
      'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl',
      'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
    ]
  },
  {
    state: 'Nagaland',
    districts: [
      'Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung',
      'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyü',
      'Tuensang', 'Wokha', 'Zünheboto'
    ]
  },
  {
    state: 'Mizoram',
    districts: [
      'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai',
      'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'
    ]
  },
  {
    state: 'Sikkim',
    districts: ['Gangtok', 'Gyalshing (West)', 'Mangan (North)', 'Namchi (South)', 'Pakyong', 'Soreng']
  },
  {
    state: 'Arunachal Pradesh',
    districts: [
      'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kamle',
      'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley',
      'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare (Itanagar)',
      'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
    ]
  },
  {
    state: 'Union Territories',
    districts: [
      'Andaman & Nicobar - Port Blair',
      'Chandigarh',
      'Dadra & Nagar Haveli (Silvassa)',
      'Daman',
      'Diu',
      'Ladakh - Leh',
      'Ladakh - Kargil',
      'Lakshadweep (Kavaratti)',
      'Puducherry',
      'Puducherry - Karaikal',
      'Puducherry - Mahe',
      'Puducherry - Yanam'
    ]
  }
];

// District to Cities / Towns Mapping
export const DISTRICT_CITIES_MAP: Record<string, string[]> = {
  // GUJARAT DISTRICTS
  'Surat': [
    'Surat City', 'Kamrej', 'Bardoli', 'Olpad', 'Mandvi', 'Mangrol',
    'Palsana', 'Mahuva', 'Umarpada', 'Hazira', 'Sachin', 'Kosamba',
    'Kadodara', 'Kim', 'Sayan', 'Chalthan'
  ],
  'Rajkot': [
    'Rajkot City', 'Gondal', 'Jetpur', 'Dhoraji', 'Upleta', 'Jasdan',
    'Kotda Sangani', 'Lodhika', 'Paddhari', 'Jamkandorna', 'Vinchhiya', 'Shapar-Veraval'
  ],
  'Ahmedabad': [
    'Ahmedabad City', 'Sanand', 'Dholka', 'Viramgam', 'Bavla', 'Dhandhuka',
    'Daskroi', 'Mandal', 'Detroj-Rampura', 'Dholera', 'Changodar'
  ],
  'Vadodara': [
    'Vadodara City', 'Padra', 'Dabhoi', 'Karjan', 'Waghodia', 'Savli',
    'Sinor', 'Desar', 'Por-Ramangamdi'
  ],
  'Anand': [
    'Anand City', 'Petlad', 'Borsad', 'Khambhat', 'Umreth', 'Sojitra',
    'Tarapur', 'Anklav', 'Vasad', 'Vallabh Vidyanagar'
  ],
  'Bhavnagar': [
    'Bhavnagar City', 'Mahuva', 'Talaja', 'Sihor', 'Palitana', 'Gariadhar',
    'Umrala', 'Vallabhipur', 'Jesar', 'Ghogha', 'Alang'
  ],
  'Junagadh': [
    'Junagadh City', 'Keshod', 'Mangrol', 'Manavadar', 'Visavadar',
    'Malia Hatina', 'Vanthali', 'Mendarda', 'Bhesan', 'Shapur'
  ],
  'Jamnagar': [
    'Jamnagar City', 'Dhrol', 'Jodiya', 'Kalavad', 'Lalpur', 'Jamjodhpur',
    'Sikka', 'Bed'
  ],
  'Gandhinagar': [
    'Gandhinagar City', 'Kalol', 'Dehgam', 'Mansa', 'Koba', 'Chiloda', 'Vavol'
  ],
  'Kutch': [
    'Bhuj', 'Gandhidham', 'Anjar', 'Mandvi-Kutch', 'Mundra', 'Nakhatrana',
    'Bhachau', 'Rapar', 'Abdasa (Naliya)', 'Lakhpat'
  ],
  'Mehsana': [
    'Mehsana City', 'Kadi', 'Visnagar', 'Vadnagar', 'Vijapur', 'Unjha',
    'Becharaji', 'Kheralu', 'Satlasana', 'Jotana'
  ],
  'Amreli': [
    'Amreli City', 'Dhari', 'Bagasara', 'Savarkundla', 'Rajula', 'Jafrabad',
    'Lathi', 'Lilia', 'Khambha', 'Babra', 'Damnagar'
  ],
  'Bharuch': [
    'Bharuch City', 'Ankleshwar', 'Jambusar', 'Vagra', 'Hansot', 'Amod',
    'Zaghadia', 'Netrang', 'Dahej'
  ],
  'Navsari': [
    'Navsari City', 'Gandevi', 'Chikhli', 'Jalalpore', 'Vansda', 'Khergam', 'Bilimora'
  ],
  'Surendranagar': [
    'Surendranagar City', 'Wadhwan', 'Dhrangadhra', 'Halvad', 'Limbdi',
    'Chotila', 'Sayla', 'Thangadh', 'Muli', 'Dasada (Patdi)'
  ],
  'Banaskantha': [
    'Palanpur', 'Deesa', 'Tharad', 'Dhanera', 'Vav', 'Radhanpur Belt',
    'Danta', 'Vadgam', 'Kankrej (Shihori)', 'Bhabhar', 'Lakhani', 'Suigam', 'Amirgarh'
  ],
  'Sabarkantha': [
    'Himmatnagar', 'Idar', 'Prantij', 'Talod', 'Khedbrahma', 'Vadali',
    'Vijay Nagar', 'Poshina'
  ],
  'Dahod': [
    'Dahod City', 'Jhalod', 'Limkheda', 'Garbada', 'Fatepura', 'Devgadh Baria',
    'Dhanpur', 'Sanjeli', 'Singvad'
  ],
  'Panchmahal': [
    'Godhra', 'Halol', 'Kalol', 'Shehra', 'Ghoghamba', 'Morva Hadaf', 'Jambughoda'
  ],
  'Valsad': [
    'Valsad City', 'Vapi', 'Pardi', 'Dharampur', 'Kaprada', 'Umbergaon'
  ],
  'Kheda': [
    'Nadiad', 'Kapadvanj', 'Mahudha', 'Matar', 'Mehmedabad', 'Thasra',
    'Kathlal', 'Vaso', 'Galteshwar', 'Dakore'
  ],
  'Patan': [
    'Patan City', 'Sidhpur', 'Chanasma', 'Harij', 'Radhanpur', 'Sami',
    'Shankheshwar', 'Santalpur'
  ],
  'Porbandar': [
    'Porbandar City', 'Ranavav', 'Kutiyana', 'Madhavpur'
  ],
  'Gir Somnath': [
    'Veraval', 'Somnath', 'Talala', 'Kodinar', 'Una', 'Gir Gadhada', 'Sutrapada'
  ],
  'Morbi': [
    'Morbi City', 'Wankaner', 'Halvad', 'Maliya Miyana', 'Tankara'
  ],
  'Botad': [
    'Botad City', 'Gadhada', 'Barwala', 'Ranpur'
  ],
  'Chhota Udaipur': [
    'Chhota Udaipur City', 'Bodeli', 'Jetpur Pavi', 'Sankheda', 'Kavant', 'Nasvadi'
  ],
  'Mahisagar': [
    'Lunawada', 'Santrampur', 'Balasinor', 'Virpur', 'Kadana', 'Khanpur'
  ],
  'Aravalli': [
    'Modasa', 'Malpur', 'Dhansura', 'Bayad', 'Meghraj', 'Bhiloda'
  ],
  'Tapi': [
    'Vyara', 'Songadh', 'Valod', 'Uchchhal', 'Nizar', 'Kukarmunda', 'Dolvan'
  ],
  'Narmada': [
    'Rajpipla', 'Nandod', 'Tilakwada', 'Dediapada', 'Sagbara', 'Garudeshwar (Kevadia)'
  ],
  'Dang': [
    'Ahwa', 'Waghai', 'Subir'
  ],
  'Devbhoomi Dwarka': [
    'Khambhalia', 'Dwarka', 'Kalyanpur', 'Bhanvad', 'Okha'
  ],

  // MAHARASHTRA DISTRICTS
  'Pune': [
    'Pune City', 'Haveli', 'Baramati', 'Shirur', 'Junnar', 'Indapur',
    'Khed (Chakan)', 'Daund', 'Bhor', 'Maval (Talegaon)', 'Mulshi (Paud)',
    'Purandar (Saswad)', 'Ambegaon (Manchar)', 'Velhe'
  ],
  'Mumbai City': [
    'South Mumbai', 'Nariman Point', 'Colaba', 'Byculla', 'Dadar', 'Worli'
  ],
  'Mumbai Suburban': [
    'Andheri', 'Bandra', 'Borivali', 'Goregaon', 'Kandivali', 'Kurla',
    'Malad', 'Ghatkopar', 'Mulund', 'Powai'
  ],
  'Thane': [
    'Thane City', 'Kalyan', 'Dombivli', 'Bhiwandi', 'Ulhasnagar', 'Ambernath',
    'Badlapur', 'Murbad', 'Shahapur'
  ],
  'Nashik': [
    'Nashik City', 'Malegaon', 'Sinnar', 'Niphad (Pimpalgaon)', 'Yeola',
    'Dindori', 'Kalwan', 'Baglan (Satana)', 'Chandwad', 'Trimbakeshwar', 'Igatpuri'
  ],
  'Nagpur': [
    'Nagpur City', 'Kamptee', 'Katol', 'Kalmeshwar', 'Saoner', 'Ramtek',
    'Umred', 'Hingna', 'Narkhed', 'Parseoni', 'Mouda', 'Kuhi', 'Bhiwapur'
  ],
  'Kolhapur': [
    'Kolhapur City', 'Karveer', 'Ichalkaranji', 'Hatkanangle', 'Shirol (Jaysingpur)',
    'Kagal', 'Gadhinglaj', 'Panhala', 'Shahuwadi', 'Radhanagari', 'Bhudargad', 'Chandgad', 'Ajra'
  ],
  'Chhatrapati Sambhajinagar (Aurangabad)': [
    'Chhatrapati Sambhajinagar City', 'Paithan', 'Gangapur', 'Vaijapur',
    'Kannad', 'Sillod', 'Khuldabad', 'Phulambri', 'Soegaon'
  ],
  'Ahmednagar': [
    'Ahmednagar City', 'Sangamner', 'Kopargaon', 'Rahata (Shirdi)', 'Shrirampur',
    'Newasa', 'Shevgaon', 'Pathardi', 'Parner', 'Jamkhed', 'Karjat', 'Rahuri', 'Akole'
  ],
  'Solapur': [
    'Solapur City', 'Pandharpur', 'Barshi', 'Akkalkot', 'Mohol', 'Karmala',
    'Madha', 'Sangola', 'Malshiras', 'Mangalwedha', 'South Solapur', 'North Solapur'
  ],
  'Jalgaon': [
    'Jalgaon City', 'Bhusawal', 'Chalisgaon', 'Amalner', 'Pachora', 'Raver',
    'Yawal', 'Jamner', 'Chopda', 'Erandol', 'Parola', 'Dharangaon', 'Bodwad'
  ],
  'Satara': [
    'Satara City', 'Karad', 'Phaltan', 'Wai', 'Koregaon', 'Patan', 'Mahabaleshwar',
    'Khandala', 'Khatav (Vaduj)', 'Maan (Dahiwadi)', 'Jaavali'
  ],
  'Sangli': [
    'Sangli-Miraj', 'Islampur (Walwa)', 'Tasgaon', 'Vita (Khanapur)', 'Palus',
    'Shirala', 'Atpadi', 'Jath', 'Kavathe Mahankal', 'Kadegaon'
  ],
  'Nanded': [
    'Nanded City', 'Mukhed', 'Deglur', 'Loha', 'Kandhar', 'Kinwat', 'Hadgaon',
    'Mudkhed', 'Bhokar', 'Biloli', 'Naigaon', 'Himayatnagar', 'Dharmabad'
  ],
  'Amravati': [
    'Amravati City', 'Achalpur', 'Warud', 'Morshi', 'Chandur Bazar', 'Daryapur',
    'Anjangaon Surji', 'Dhamangaon Rly', 'Teosa', 'Nandgaon Khandeshwar', 'Dharni', 'Chikhaldara'
  ],
  'Latur': [
    'Latur City', 'Udgir', 'Ahmedpur', 'Ausa', 'Nilanga', 'Chakur', 'Renapur',
    'Shirur Anantpal', 'Deoni', 'Jalkot'
  ],

  // RAJASTHAN DISTRICTS
  'Jaipur': [
    'Jaipur City', 'Sanganer', 'Amber (Amer)', 'Bassi', 'Chomu', 'Chaksu',
    'Jamwa Ramgarh', 'Phagi', 'Kotputli', 'Shahpura', 'Sambhar Lake', 'Bagru'
  ],
  'Jodhpur': [
    'Jodhpur City', 'Luni', 'Bilara', 'Bhopalgarh', 'Piparcity', 'Osian',
    'Bawari', 'Shergarh', 'Balesar', 'Phalodi Hub'
  ],
  'Kota': [
    'Kota City', 'Ladpura', 'Sangod', 'Ramganj Mandi', 'Digod', 'Pipalda (Itawa)', 'Mandana'
  ],
  'Bikaner': [
    'Bikaner City', 'Nokha', 'Lunkaransar', 'Kolayat', 'Khajuwala', 'Dungargarh', 'Poogal'
  ],
  'Ajmer': [
    'Ajmer City', 'Kishangarh', 'Beawar', 'Nasirabad', 'Pushkar', 'Kekri',
    'Masuda', 'Sarwar', 'Peesangan'
  ],
  'Udaipur': [
    'Udaipur City', 'Girwa', 'Mavli', 'Vallabhnagar', 'Salumbar Hub', 'Kherwara',
    'Rishabhdeo', 'Jhadol', 'Gogunda', 'Kotra', 'Fatehnagar'
  ],
  'Alwar': [
    'Alwar City', 'Bhiwadi', 'Behror', 'Tijara', 'Kishangarh Bas', 'Ramgarh',
    'Rajgarh', 'Thanagazi', 'Bansur', 'Kathumar', 'Neemrana'
  ],
  'Sri Ganganagar': [
    'Sri Ganganagar City', 'Suratgarh', 'Raisinghnagar', 'Anupgarh Hub',
    'Sadulshahar', 'Padampur', 'Karanpur', 'Gharsana', 'Vijaynagar'
  ],

  // MADHYA PRADESH DISTRICTS
  'Indore': [
    'Indore City', 'Mhow (Dr. Ambedkar Nagar)', 'Sanwer', 'Depalpur', 'Hatod', 'Rau'
  ],
  'Bhopal': [
    'Bhopal City', 'Huzur', 'Berasia', 'Kolar', 'Bairagarh (Sant Hirdaram Nagar)'
  ],
  'Jabalpur': [
    'Jabalpur City', 'Sihora', 'Patan', 'Panagar', 'Shahpura', 'Kundam', 'Majholi'
  ],
  'Gwalior': [
    'Gwalior City', 'Dabra', 'Bhitarwar', 'Morar', 'Ghatigaon'
  ],
  'Ujjain': [
    'Ujjain City', 'Nagda', 'Khachrod', 'Mahidpur', 'Tarana', 'Badnagar', 'Ghatiya'
  ],
  'Dhar': [
    'Dhar City', 'Pithampur', 'Badnawar', 'Kukshi', 'Manawar', 'Sardarpur', 'Dhamnod'
  ],
  'Khargone': [
    'Khargone City', 'Barwaha', 'Sanawad', 'Kasrawad', 'Bhikangaon', 'Maheshwar', 'Gogawan'
  ],

  // UTTAR PRADESH DISTRICTS
  'Lucknow': [
    'Lucknow City', 'Mohanlalganj', 'Malihabad', 'Bakshi Ka Talab', 'Sarojini Nagar',
    'Kakori', 'Gosainganj', 'Chinhat'
  ],
  'Kanpur Nagar': [
    'Kanpur City', 'Bilhauur', 'Ghatampur', 'Kalyanpur', 'Bithoor', 'Chakeri', 'Sarsaul'
  ],
  'Varanasi': [
    'Varanasi City', 'Pindra', 'Raja Talab', 'Shivpur', 'Ramnagar', 'Rohania'
  ],
  'Agra': [
    'Agra City', 'Fatehabad', 'Bah', 'Etmadpur', 'Kheragarh', 'Kiraoli', 'Shamshabad'
  ],
  'Prayagraj (Allahabad)': [
    'Prayagraj City', 'Phulpur', 'Koraon', 'Handia', 'Karchhana', 'Soraon', 'Meja', 'Bara'
  ],
  'Meerut': [
    'Meerut City', 'Mawana', 'Sardhana', 'Hastinapur', 'Daurala', 'Kithore'
  ],
  'Gautam Buddha Nagar (Noida)': [
    'Noida', 'Greater Noida', 'Dadri', 'Jewar', 'Dankaur', 'Rabupura'
  ],

  // PUNJAB DISTRICTS
  'Ludhiana': [
    'Ludhiana City', 'Khanna', 'Jagraon', 'Samrala', 'Raikot', 'Payal', 'Sahnewal', 'Mullanpur'
  ],
  'Amritsar': [
    'Amritsar City', 'Ajnala', 'Baba Bakala', 'Majitha', 'Attari', 'Jandiala Guru'
  ],
  'Jalandhar': [
    'Jalandhar City', 'Nakodar', 'Phillaur', 'Shahkot', 'Kartarpur', 'Goraya', 'Adampur'
  ],
  'Bathinda': [
    'Bathinda City', 'Rampura Phul', 'Talwandi Sabo', 'Maur', 'Bhucho Mandi', 'Goniana'
  ],

  // HARYANA DISTRICTS
  'Gurugram': [
    'Gurugram City', 'Sohna', 'Pataudi', 'Manesar', 'Farrukhnagar', 'Badshahpur'
  ],
  'Karnal': [
    'Karnal City', 'Gharaunda', 'Assandh', 'Nilokheri', 'Indri', 'Taraori'
  ],
  'Hisar': [
    'Hisar City', 'Hansi', 'Barwala', 'Narnaund', 'Adampur', 'Uklana'
  ],
  'Panipat': [
    'Panipat City', 'Samalkha', 'Israna', 'Madlauda', 'Bapoli'
  ],

  // KARNATAKA DISTRICTS
  'Bengaluru Urban': [
    'Bengaluru City', 'Yelahanka', 'Kengeri', 'Anekal', 'KR Puram', 'Electronic City', 'Whitefield'
  ],
  'Mysuru': [
    'Mysuru City', 'Nanjangud', 'Hunsur', 'T. Narasipura', 'Periyapatna', 'K.R. Nagar', 'H.D. Kote'
  ],
  'Belagavi': [
    'Belagavi City', 'Gokak', 'Chikkodi', 'Bailhongal', 'Athani', 'Saundatti', 'Khanapur', 'Hukkeri'
  ],
  'Dharwad (Hubballi)': [
    'Hubballi', 'Dharwad', 'Navalgund', 'Kundgol', 'Kalghatgi', 'Alnavar'
  ],

  // TAMIL NADU DISTRICTS
  'Chennai': [
    'Chennai Central', 'T. Nagar', 'Adyar', 'Mylapore', 'Anna Nagar', 'Guindy', 'Velachery'
  ],
  'Coimbatore': [
    'Coimbatore City', 'Pollachi', 'Mettupalayam', 'Sulur', 'Annur', 'Kinathukadavu', 'Valparai'
  ],
  'Madurai': [
    'Madurai City', 'Melur', 'Tirumangalam', 'Usilampatti', 'Vadipatti', 'Sholavandan'
  ],
  'Tiruchirappalli': [
    'Tiruchirappalli City', 'Srirangam', 'Manapparai', 'Musiri', 'Thuraiyur', 'Lalgudi'
  ],

  // TELANGANA DISTRICTS
  'Hyderabad': [
    'Hyderabad Central', 'Secunderabad', 'Charminar', 'Khairatabad', 'Golconda', 'Amberpet'
  ],
  'Warangal': [
    'Warangal City', 'Hanamkonda', 'Kazipet', 'Narsampet', 'Parkal', 'Wardhannapet'
  ],
  'Nizamabad': [
    'Nizamabad City', 'Bodhan', 'Armoor', 'Bheemgal', 'Varni', 'Dichpally'
  ],

  // ANDHRA PRADESH DISTRICTS
  'Visakhapatnam': [
    'Visakhapatnam City', 'Gajuwaka', 'Anakapalle Hub', 'Bheemunipatnam', 'Pendurthi'
  ],
  'NTR (Vijayawada)': [
    'Vijayawada City', 'Mylavaram', 'Tiruvuru', 'Jaggayyapeta', 'Nandigama', 'G Konduru'
  ],
  'Guntur': [
    'Guntur City', 'Tenali', 'Mangalagiri', 'Ponnur', 'Tadikonda', 'Medikonduru'
  ],

  // BIHAR DISTRICTS
  'Patna': [
    'Patna City', 'Danapur', 'Barh', 'Mokama', 'Phulwari Sharif', 'Bikram', 'Fatuha', 'Masaurhi'
  ],
  'Gaya': [
    'Gaya City', 'Bodh Gaya', 'Sherghati', 'Tekari', 'Wazirganj', 'Manpur', 'Atri'
  ],
  'Muzaffarpur': [
    'Muzaffarpur City', 'Kanti', 'Motipur', 'Sahebganj', 'Sakra', 'Minapur', 'Paroo'
  ],

  // WEST BENGAL DISTRICTS
  'Kolkata': [
    'Central Kolkata', 'North Kolkata', 'South Kolkata', 'Salt Lake', 'Alipore', 'Behala'
  ],
  'North 24 Parganas': [
    'Barasat', 'Barrackpore', 'Bangaon', 'Basirhat', 'Habra', 'Bhatpara', 'Naihati'
  ],
  'Purba Bardhaman': [
    'Bardhaman City', 'Katwa', 'Kalna', 'Memari', 'Galsi', 'Bhatar', 'Raina'
  ],

  // KERALA DISTRICTS
  'Ernakulam (Kochi)': [
    'Kochi City', 'Aluva', 'Paravur', 'Muvattupuzha', 'Kothamangalam', 'Angamaly', 'Perumbavoor'
  ],
  'Thiruvananthapuram': [
    'Thiruvananthapuram City', 'Neyyattinkara', 'Nedumangad', 'Attingal', 'Varkala', 'Kattakada'
  ],

  // DELHI
  'New Delhi': [
    'Connaught Place', 'Chanakyapuri', 'Barakhamba', 'Lodhi Colony', 'Vasant Vihar'
  ],
  'South Delhi': [
    'Hauz Khas', 'Saket', 'Mehrauli', 'Greater Kailash', 'Malviya Nagar', 'Sainik Farm'
  ]
};

// City to Talukas / Areas / Villages Mapping
export const CITY_AREAS_MAP: Record<string, string[]> = {
  // SURAT DISTRICT CITIES
  'Kamrej': [
    'Kamrej Gam (કામરેજ ગામ)', 'Kholwad (ખોલવડ)', 'Pasodara (પાસોદરા)',
    'Vav (વાવ)', 'Valak (વાલક)', 'Dhoran Pardi (ધોરણ પારડી)',
    'Antroli (અંત્રોલી)', 'Kathor (કઠોર)', 'Laskana (લસ્કાણા)',
    'Sarthana Agri Belt (સરથાણા)', 'Sevni (સેવણી)', 'Netrang Farm Cluster'
  ],
  'Bardoli': [
    'Baben (બાબેન)', 'Afwa (અફવા)', 'Isroli (ઇસરોલી)', 'Rayam (રાયમ)',
    'Madhi (મઢી)', 'Ten (તેન)', 'Sarbhon (સરભોણ)', 'Bardoli APMC Hub',
    'Vankaneda (વાંકનેડા)', 'Kadod (કડોદ)', 'Khoj (ખોજ)'
  ],
  'Olpad': [
    'Olpad Gam (ઓલપાડ ગામ)', 'Masma (મસમા)', 'Sayan Road (સાયણ રોડ)',
    'Saras (સરસ)', 'Kareli (કારેલી)', 'Kim Char Rasta', 'Mulad (મુળદ)',
    'Kudiana (કુદિયાણા)', 'Dandi Road Area', 'Ariana (અરિયાણા)'
  ],
  'Surat City': [
    'Varachha Agri Market', 'Katargam', 'Adajan', 'Pal-Gam', 'Vesu Farm Area',
    'Jahangirpura', 'Dindoli', 'Althan', 'Pandesara', 'Amroli', 'Limbayat'
  ],
  'Mandvi': [
    'Mandvi Gam', 'Tadkeshwar (તડકેશ્વર)', 'Areth (અરેઠ)', 'Godavadi (ગોદાવડી)',
    'Pipalwada', 'Varethi', 'Devgadh', 'Zankhvav'
  ],
  'Mangrol': [
    'Kosamba (કોસંબા)', 'Mota Borsara', 'Harsani', 'Vankal', 'Velachha',
    'Zankhvav Border', 'Mosali (મોસાલી)', 'Pipodara Agri Zone'
  ],
  'Palsana': [
    'Palsana Gam', 'Tantithaiya', 'Kadodara Char Rasta', 'Gangadhara',
    'Chalthan Sugar Factory Area', 'Bagumara', 'Jolwa'
  ],
  'Mahuva': [
    'Mahuva Gam', 'Karchelia (કરચેલીયા)', 'Anaval (અનાવલ)', 'Bhoria',
    'Vankla', 'Dholikui', 'Gopla'
  ],
  'Hazira': [
    'Hazira Coastal Farm', 'Mora (મોરા)', 'Damka', 'Bhatlai', 'Suvali', 'Sunwali'
  ],
  'Sachin': [
    'Sachin Gam', 'Kansad', 'Lajpore', 'Vanz', 'Pardi Kande', 'Hojiwala'
  ],
  'Kim': [
    'Kim Station Area', 'Kudsad', 'Pardi', 'Kathodara', 'Mulad Border'
  ],
  'Sayan': [
    'Sayan Sugar Mill Area', 'Sandhier', 'Delad', 'Kalyan Farm', 'Gothan'
  ],

  // RAJKOT DISTRICT CITIES
  'Rajkot City': [
    'Mavdi Gam', 'Nana Mava', 'Kothariya', 'Raiya Farm Belt',
    'Madhapar', 'Bedipara APMC', 'Aji Vasahat Area', 'Thorala'
  ],
  'Gondal': [
    'Gondal APMC Mandi Yard', 'Gomta (ગોમતા)', 'Shrinathgadh', 'Bandhiya',
    'Daiya', 'Bhojpara', 'Moti Marad', 'Ribda', 'Bhavabhai Nu Gam'
  ],
  'Jetpur': [
    'Navagadh', 'Pithadiya', 'Kagvad Khodaldham', 'Mevasa', 'Pedhla',
    'Derdi', 'Mandva', 'Amarnagar'
  ],
  'Dhoraji': [
    'Jamnavad', 'Fareni', 'Patanvav', 'Bhadajalia', 'Supedi', 'Toraniya', 'Moti Parabadi'
  ],
  'Upleta': [
    'Bhayavadar', 'Kolki', 'Dumiyani', 'Paneli Moti', 'Rabarika', 'Varjang Jalia'
  ],
  'Jasdan': [
    'Atkot', 'Vinchhiya Road Hub', 'Gadhadiya', 'Shivrajpur', 'Sanathali', 'Kamalpur'
  ],

  // AHMEDABAD DISTRICT CITIES
  'Sanand': [
    'Sanand Gam', 'Chekhla', 'Nidhrad', 'Bol', 'Modasar', 'Manipur',
    'Telav', 'Goraj', 'Sanosan', 'Kolat'
  ],
  'Dholka': [
    'Koth', 'Baval', 'Rampur', 'Saroda', 'Trasad', 'Ambethi', 'Vautha Sangam Area'
  ],
  'Viramgam': [
    'Hansalpur', 'Sokali', 'Mandal Road', 'Bhojwa', 'Karakthal', 'Jakhwada'
  ],
  'Bavla': [
    'Bagodara Hub', 'Dhegam', 'Salajada', 'Adroda', 'Chiyada', 'Rupal'
  ],
  'Ahmedabad City': [
    'Naroda APMC', 'Nikol Gam', 'Odhav', 'Vatva Rural', 'Chandkheda', 'Bopal Farm Area'
  ],

  // VADODARA DISTRICT CITIES
  'Vadodara City': [
    'Manjalpur', 'Gotri Agri Belt', 'Sama', 'Makarpura', 'Harni', 'Gorwa', 'Chhani'
  ],
  'Padra': [
    'Padra APMC Yard', 'Mobha Road', 'Vadu', 'Chokari', 'Mujpur', 'Mahuvad', 'Kanjat'
  ],
  'Dabhoi': [
    'Dabhoi Fort Area', 'Karnali Narmada Bank', 'Chandod Holy Sangam', 'Shinor Road', 'Sitpur'
  ],
  'Karjan': [
    'Miyagam Karjan', 'Kandari', 'Choranda', 'Valan', 'Sampa', 'Dethan'
  ],

  // ANAND DISTRICT CITIES
  'Anand City': [
    'Amul Dairy Zone', 'Bakrol', 'Mogri', 'Jitodia', 'Gamdi', 'Chikhodra'
  ],
  'Petlad': [
    'Petlad Town', 'Rangaipura', 'Pandoli', 'Dharmaj Tobacco Capital', 'Nar', 'Sunav'
  ],
  'Borsad': [
    'Borsad APMC', 'Bhadran', 'Vasadia', 'Napa Talpad', 'Dahewan', 'Alarsa'
  ],

  // MAHARASHTRA CITIES
  'Pune City': [
    'Hadapsar Market Yard', 'Kothrud', 'Baner Agri Greenery', 'Wagholi Farm Belt',
    'Sinhagad Road Khadakwasla', 'Fursungi', 'Manjri Farm'
  ],
  'Baramati': [
    'Baramati APMC Hub', 'Malegaon Khurd Sugar Belt', 'Songaon', 'Rui Farm',
    'Shirsuphal', 'Korhale', 'Jalochi', 'Medad'
  ],
  'Shirur': [
    'Shirur Town', 'Shikrapur', 'Sanaswadi', 'Talegaon Dhamdhere', 'Mandavgan Farata', 'Pabal'
  ],
  'Khed (Chakan)': [
    'Chakan Market Yard', 'Rajgurunagar', 'Alandi Devachi', 'Kadus', 'Wada', 'Mahalunge'
  ],
  'Nashik City': [
    'Nashik APMC Onion Hub', 'Panchavati', 'Satpur', 'Ambad', 'Deolali', 'Adgaon'
  ],
  'Sinnar': [
    'Sinnar Town', 'Musgaon', 'Wavi', 'Pangri', 'Dodi', 'Baragaon Pimpri'
  ],
  'Niphad (Pimpalgaon)': [
    'Pimpalgaon Baswant Tomato Market', 'Niphad Station', 'Ranwad', 'Lasalgaon Onion APMC', 'Saykheda'
  ],
  'Nagpur City': [
    'Nagpur Orange APMC', 'Kalamna Market', 'Kamptee Road', 'Wadi', 'Hingna Industrial Belt'
  ],
  'Kolhapur City': [
    'Shahupuri Gur Market', 'Karveer', 'Shiroli', 'Uchgaon', 'Gandhinagar Kolhapur'
  ],

  // RAJASTHAN CITIES
  'Jaipur City': [
    'Muhana Mandi Agri Hub', 'Sanganer', 'Jagatpura Farm Area', 'Mansarovar', 'Sirsi Road'
  ],
  'Chomu': [
    'Chomu Vegetable Mandi', 'Morija', 'Kaladera', 'Samod Fort Area', 'Radhaswami Dham', 'Hasteda'
  ],
  'Bassi': [
    'Bassi Town', 'Kanota', 'Tunga', 'Mohanpura', 'Sambhariya', 'Banskho'
  ],
  'Jodhpur City': [
    'Bhadwasia Mandi', 'Mandore', 'Basni', 'Luni Junction Area', 'Pal Road Farm'
  ],
  'Kota City': [
    'Bhamashah Mandi Kota', 'DCM Area', 'Kunhari', 'Ranpur', 'Nayapura'
  ],

  // MADHYA PRADESH CITIES
  'Indore City': [
    'Choithram Mandi Hub', 'Laxmibai Nagar Mandi', 'Rau Farm Cluster', 'Sanwer Road', 'Kanadia'
  ],
  'Bhopal City': [
    'Karond Mandi Hub', 'Berasia Road', 'Kolar Agri Belt', 'Bairagarh', 'Misrod'
  ],

  // UTTAR PRADESH CITIES
  'Lucknow City': [
    'Dubagga Mandi', 'Gomti Nagar Extension', 'Mohan Road', 'Alambagh', 'Chinhat Farm Belt'
  ],
  'Mohanlalganj': [
    'Mohanlalganj Block', 'Nigohan', 'Sissendi', 'Gosainganj', 'Mau', 'Khujoli'
  ],
  'Malihabad': [
    'Malihabad Mango Belt', 'Kasmandi Kalan', 'Saspan', 'Bakshi Ka Talab Link', 'Rahimbad'
  ],
  'Kanpur City': [
    'Chakeri', 'Kalyanpur', 'Panki Agri Zone', 'Bithoor Ganga Bank', 'Mandhana'
  ],

  // PUNJAB CITIES
  'Ludhiana City': [
    'Gill Road Agri Hub', 'Sahnewal Mandi', 'Haibowal', 'Mundian Kalan', 'Ferozepur Road'
  ],
  'Khanna': [
    'Khanna Grain Market (Asia Largest)', 'Samrala Road', 'Bhadla', 'Alour', 'Libra'
  ],
  'Amritsar City': [
    'Bhagtanwala Grain Market', 'Chheharta', 'Majitha Road', 'Verka Milk Plant Area'
  ]
};

/**
 * Returns list of all States & UTs in India
 */
export function getAllStates(): string[] {
  return INDIA_STATES_AND_DISTRICTS.map((s) => s.state);
}

/**
 * Returns all districts belonging to a specific state
 */
export function getDistrictsByState(stateName: string): string[] {
  const match = INDIA_STATES_AND_DISTRICTS.find(
    (s) => s.state.toLowerCase() === stateName.toLowerCase()
  );
  return match ? match.districts : [];
}

/**
 * Returns all Indian districts with their corresponding state
 */
export function getAllIndiaDistrictsGrouped(): StateDistrictMapping[] {
  return INDIA_STATES_AND_DISTRICTS;
}

/**
 * Returns flat sorted list of all Indian district names (~780 districts)
 */
export function getAllIndiaDistrictNames(): string[] {
  const list: string[] = [];
  for (const s of INDIA_STATES_AND_DISTRICTS) {
    list.push(...s.districts);
  }
  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns the cities / towns for a given district.
 * If specific cities are not hardcoded, generates sensible agricultural & municipal centers.
 */
export function getCitiesForDistrict(districtName: string): string[] {
  if (!districtName) return [];

  // 1. Check exact key or case-insensitive match
  if (DISTRICT_CITIES_MAP[districtName]) {
    return DISTRICT_CITIES_MAP[districtName];
  }

  const foundKey = Object.keys(DISTRICT_CITIES_MAP).find(
    (k) => k.toLowerCase() === districtName.toLowerCase()
  );
  if (foundKey && DISTRICT_CITIES_MAP[foundKey]) {
    return DISTRICT_CITIES_MAP[foundKey];
  }

  // 2. Dynamic high-quality fallback for any district in India
  return [
    `${districtName} City / Central`,
    `${districtName} APMC Mandi Hub`,
    `${districtName} Rural / Block 1`,
    `${districtName} North Tehsil`,
    `${districtName} South Tehsil`,
    `${districtName} East Agro-Cluster`,
    `${districtName} West Sub-Division`
  ];
}

/**
 * Returns the talukas, areas, or villages for a given city and district.
 * If specific areas are not hardcoded, generates sensible rural talukas / villages.
 */
export function getAreasForCity(cityName: string, districtName?: string): string[] {
  if (!cityName) return [];

  // 1. Check exact key or case-insensitive match
  if (CITY_AREAS_MAP[cityName]) {
    return CITY_AREAS_MAP[cityName];
  }

  const foundKey = Object.keys(CITY_AREAS_MAP).find(
    (k) => k.toLowerCase() === cityName.toLowerCase()
  );
  if (foundKey && CITY_AREAS_MAP[foundKey]) {
    return CITY_AREAS_MAP[foundKey];
  }

  const cleanCity = cityName.replace(/\s+(City|Town|Rural|Hub|Block\s*\d+|Tehsil)/gi, '').trim() || cityName;
  const dist = districtName || 'Local';

  // 2. Dynamic high-quality fallback for any city / town in India
  return [
    `${cleanCity} Gam / Main Village`,
    `${cleanCity} APMC Market Yard Area`,
    `${cleanCity} Rural Agricultural Belt`,
    `${cleanCity} West Village Cluster`,
    `${cleanCity} East Farm Zone`,
    `${cleanCity} Canal / Irrigation Sector`,
    `${cleanCity} Extension Ward 1`,
    `${cleanCity} KVK Extension Hamlet`
  ];
}
