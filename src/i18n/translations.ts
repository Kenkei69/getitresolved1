export type Language = 'EN' | 'HI';

export const translations = {
  EN: {
    // Top Bar & Branding
    govTitle: 'Government of India',
    portalName: 'Get It Resolved',
    portalSub: 'AI-Powered Public Grievance Redressal System',
    loginBtn: 'Citizen Portal',
    loginDesc: 'Access citizen services & ticket tracking',
    loginModalTitle: 'JanSewa Citizen Portal',
    loginModalSub: 'Sign in via Mobile OTP or DigiLocker',
    mobileNumber: '10-Digit Mobile Number',
    requestOtp: 'Request OTP',
    themeToggleLight: 'Switch to Light Mode',
    themeToggleDark: 'Switch to Dark Mode',
    menuToggle: 'Toggle Navigation Menu',
    close: 'Close',

    // Navigation Tabs
    navHome: 'Home',
    navReport: 'Report Issue',
    navTrack: 'Track Issue',
    navHelp: 'Help & Support',

    // Hero Section
    heroBadge: 'Citizen Grievance Submission',
    heroTitle1: 'Report a Public Issue',
    heroTitle2: 'in Just a Few Steps.',
    heroSub:
      'Submit your grievance, and our system will categorize and route it to the right department for faster action.',
    btnReport: 'Report an Issue',
    btnTrack: 'Track Your Issue',

    // AI Routing Card (Hero)
    aiRoutingTitle: 'Automated Routing',
    aiStep1: 'Analyze your issue',
    aiStep2: 'Categorize automatically',
    aiStep3: 'Route to the right department',

    // Departments
    deptPWD: 'Public Works (PWD)',
    deptWater: 'Water & Sanitation',
    deptElectricity: 'Electricity',
    deptMunicipal: 'Municipal Services',
    deptAll: 'All Departments',

    // Features Section
    feat1Title: 'Simple & Guided',
    feat1Desc: 'Report issues in 3 clear steps',
    feat2Title: 'Automated Routing',
    feat2Desc: 'Categorized to the right municipal department',
    feat3Title: 'Track in Real-Time',
    feat3Desc: 'Check live status and resolution progress',
    feat4Title: 'Transparent & Accountable',
    feat4Desc: 'Citizen-verified resolution workflows',

    // Live Metrics Banner
    statTotal: 'Grievances Registered',
    statResolved: 'Resolved',
    statInProgress: 'In Progress',
    statResolutionRate: 'Resolution Rate',
    liveDbNotice: 'Live records from grievance database',
    noStatsYet: 'Awaiting initial complaints',

    // Report Issue Wizard
    reportPageBadge: 'Guided Citizen Grievance Filing',
    reportPageTitle: 'Report a Public Issue',
    step1Tab: '1. Issue Details',
    step2Tab: '2. Location & Evidence',
    step3Tab: '3. Routing Review & Submit',
    step1Heading: 'Step 1: Describe the Problem',
    step1Sub: 'Provide a clear summary and detailed description of the public issue.',
    step2Heading: 'Step 2: Location & Supporting Evidence',
    step2Sub: 'Specify where the issue occurred and optionally attach a photo.',
    step3Heading: 'Step 3: Review & Submit',
    step3Sub: 'Review automated categorization, estimated priority, and submit.',

    // Step 1 Fields
    labelTitle: 'Issue Headline / Summary *',
    phTitle: 'e.g., Collapsed road pothole near City Hospital or Live electric wire...',
    labelDesc: 'Detailed Description *',
    phDesc: 'Describe what happened, how long the issue has persisted, and if it poses safety hazards...',
    btnAutoFill: 'Auto-Fill Sample Issue',
    btnContinueStep2: 'Continue to Location & Evidence',

    // Step 2 Fields
    labelLocation: 'Incident Location / Ward *',
    phLocation: 'e.g., Sector 17, Near City Park, Bhopal, MP',
    labelPhoto: 'Attach Supporting Photograph (Optional)',
    photoDragDrop: 'Click to upload site photo or drag and drop',
    photoFormats: 'Supported: JPG, PNG, WEBP (Max 5MB)',
    photoRemove: 'Remove Photograph',
    photoSizeError: 'File is too large. Maximum allowed size is 5MB.',
    photoTypeError: 'Invalid file format. Please select a JPG, PNG, or WEBP image.',
    photoStorageNotice: 'Photo staged locally. Cloud bucket integration is managed by the administrator.',
    btnBackStep1: 'Back to Issue Details',
    btnContinueStep3: 'Continue to Review',

    // Step 3 Fields
    summaryHeadline: 'Summary of Your Report',
    reviewTitle: 'Headline',
    reviewLocation: 'Location',
    reviewDesc: 'Description',
    reviewPhotoAttached: 'Photo Attached',
    reviewNoPhoto: 'No photo attached',
    simulationNotice: 'Keyword-Based Routing Simulation',
    simulationSub: 'Heuristic model calculates preliminary priority and routing',
    paramPriority: 'Priority',
    paramDuration: 'Duration',
    paramUrgency: 'Urgency',
    paramFeasibility: 'Feasibility',
    scoreFooterTitle: 'Core Score',
    scoreFooterSub: 'Computed priority weighting (0 - 10)',
    autoDispatchTitle: 'Assigned Department',
    btnBackStep2: 'Back to Location',
    btnSubmitGrievance: 'Submit Grievance to Portal',
    btnSubmitting: 'Submitting Grievance...',

    // Receipt Screen
    receiptTitle: 'Grievance Registered & Dispatched',
    receiptDesc: 'Your complaint has been permanently recorded in the database.',
    receiptTrackingId: 'Tracking ID',
    receiptDepartment: 'Assigned Department',
    receiptAuthority: 'Authority Code',
    receiptCoreScore: 'Core Score',
    btnTrackQueue: 'Track Issue in Queue',
    btnFileAnother: 'File Another Issue',

    // Validation Errors
    errFillRequired: 'Please complete all required fields before proceeding.',
    errTitleRequired: 'Title is required (minimum 3 characters).',
    errDescRequired: 'Description is required (minimum 10 characters).',
    errLocationRequired: 'Location is required (minimum 3 characters).',

    // Track Page
    trackBadge: 'Ranked by Importance & Submission Time',
    trackTitle: 'Track Public Grievances',
    trackSub: 'Search and inspect verified municipal complaints',
    phSearch: 'Search by Tracking ID, location, or keyword...',
    filterByGrade: 'Filter by Score Star (> 7):',
    filterCategory: 'Category:',
    filterStatus: 'Status:',
    statusAll: 'All Statuses',
    statusPending: 'Submitted / Pending',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',
    categoryAll: 'All Categories',
    starPriority: 'Priority > 7',
    starDuration: 'Duration > 7',
    starUrgency: 'Urgency > 7',
    starFeasibility: 'Feasibility > 7',
    activeFilter: 'Active',
    toggleFilter: 'Filter',
    loadingGrievances: 'Loading grievances from database...',
    connectingDb: 'Querying live redressal system',
    failedGrievances: 'Failed to load grievances',
    btnRetry: 'Retry Connection',
    noGrievancesTitle: 'No Grievances Found',
    noGrievancesMatch: 'No complaints match your search or filter parameters.',
    noGrievancesDb: 'No grievances recorded yet in the database. Submitted issues will appear here in real time.',
    btnResetFilters: 'Reset All Filters',
    showingRecords: 'Showing',
    ofRecords: 'of',
    recordsLabel: 'grievances',
    btnLoadMore: 'Load More Grievances',
    loadingMore: 'Loading more...',

    // Complaint Card
    cardRank: 'Rank #',
    cardCitizensAffected: 'Citizens Affected',
    cardCoreScoreLabel: 'Core Score',

    // Modal
    modalTitle: 'Grievance Details',
    modalAuthority: 'Authority',
    modalTracking: 'Tracking ID',
    modalStatus: 'Status',
    modalCreated: 'Submitted',

    // Help & Support Page
    helpBadge: 'Citizen Support & Redressal Charter',
    helpTitle: 'How Can We Help You Today?',
    helpSub: 'Learn how public grievances are categorized, routed, and resolved under municipal SLA guidelines.',
    contactHelplineTitle: 'National Toll-Free Helpline',
    contactHelplineSub: '24x7 Citizen Call Center Support',
    contactEmailTitle: 'Nodal Appellate Authority',
    contactEmailSub: 'Direct escalation for overdue tickets',
    contactSlaTitle: 'SLA Resolution Target',
    contactSlaSub: 'Standard municipal response guideline',
    contactSlaVal: '3-7 Business Days',
    faqHeading: 'Frequently Asked Questions',

    // Feedback Form (Help & Support)
    feedbackHeading: 'Submit Feedback or Report a System Issue',
    feedbackSub: 'Help us improve the GetItResolved citizen grievance portal.',
    fbLabelName: 'Your Name (Optional)',
    fbPhName: 'e.g., Rajesh Kumar',
    fbLabelContact: 'Email or Mobile Number *',
    fbPhContact: 'e.g., rajesh@example.com or 9876543210',
    fbLabelType: 'Feedback Category *',
    fbTypeBug: 'Report a Portal Bug / Problem',
    fbTypeSuggestion: 'Feature Suggestion',
    fbTypeDept: 'Municipal Department Service Feedback',
    fbTypeGeneral: 'General Inquiry',
    fbLabelMessage: 'Your Message / Feedback *',
    fbPhMessage: 'Please describe the bug or suggestion in detail...',
    btnSubmitFeedback: 'Submit Citizen Feedback',
    fbSuccessTitle: 'Feedback Recorded',
    fbSuccessMsg:
      'Thank you! Your feedback has been validated and logged in your current session. (Note: Server-side persistence will be enabled when the Feedback API is provisioned).',
    fbErrRequired: 'Please provide your contact information and message (min 10 characters).',

    // Footer
    footerGov: 'Government of India • Ministry of Housing and Urban Affairs',
    footerRights: 'All Rights Reserved. Official Citizen Grievance Redressal Portal.'
  },

  HI: {
    // Top Bar & Branding
    govTitle: 'भारत सरकार',
    portalName: 'गेट इट रिज़ॉल्व्ड',
    portalSub: 'एआई-संचालित जन शिकायत निवारण प्रणाली',
    loginBtn: 'नागरिक पोर्टल',
    loginDesc: 'नागरिक सेवाएँ और शिकायत ट्रैकिंग',
    loginModalTitle: 'जनसेवा नागरिक पोर्टल',
    loginModalSub: 'मोबाइल ओटीपी या डिजिलॉकर के माध्यम से लॉगिन करें',
    mobileNumber: '10-अंकीय मोबाइल नंबर',
    requestOtp: 'ओटीपी प्राप्त करें',
    themeToggleLight: 'लाइट मोड में बदलें',
    themeToggleDark: 'डार्क मोड में बदलें',
    menuToggle: 'नेविगेशन मेनू खोलें',
    close: 'बंद करें',

    // Navigation Tabs
    navHome: 'होम',
    navReport: 'शिकायत दर्ज करें',
    navTrack: 'स्थिति जानें',
    navHelp: 'सहायता एवं संपर्क',

    // Hero Section
    heroBadge: 'नागरिक शिकायत पंजीकरण',
    heroTitle1: 'जन शिकायत दर्ज करें',
    heroTitle2: 'बस कुछ आसान चरणों में।',
    heroSub:
      'अपनी शिकायत दर्ज करें, और हमारी प्रणाली त्वरित कार्रवाई के लिए इसे सही विभाग को स्वचालित रूप से भेज देगी।',
    btnReport: 'शिकायत दर्ज करें',
    btnTrack: 'शिकायत ट्रैक करें',

    // AI Routing Card (Hero)
    aiRoutingTitle: 'स्वचालित रूटिंग',
    aiStep1: 'शिकायत का विश्लेषण',
    aiStep2: 'स्वचालित वर्गीकरण',
    aiStep3: 'सही विभाग को प्रेषण',

    // Departments
    deptPWD: 'लोक निर्माण विभाग (PWD)',
    deptWater: 'जल एवं स्वच्छता विभाग',
    deptElectricity: 'विद्युत विभाग',
    deptMunicipal: 'नगर पालिका सेवाएँ',
    deptAll: 'सभी विभाग',

    // Features Section
    feat1Title: 'सरल एवं मार्गदर्शित',
    feat1Desc: '3 आसान चरणों में शिकायत दर्ज करें',
    feat2Title: 'स्वचालित रूटिंग',
    feat2Desc: 'सीधे संबंधित नगरपालिका विभाग को प्रेषित',
    feat3Title: 'लाइव ट्रैकिंग',
    feat3Desc: 'शिकायत निवारण की स्थिति तुरंत जानें',
    feat4Title: 'पारदर्शी एवं जवाबदेह',
    feat4Desc: 'नागरिक-सत्यापित समयबद्ध समाधान',

    // Live Metrics Banner
    statTotal: 'कुल दर्ज शिकायतें',
    statResolved: 'सफलतापूर्वक निस्तारित',
    statInProgress: 'प्रक्रियाधीन',
    statResolutionRate: 'निस्तारण दर',
    liveDbNotice: 'डेटाबेस से सीधे सत्यापित वास्तविक आँकड़े',
    noStatsYet: 'प्रारंभिक शिकायतों की प्रतीक्षा',

    // Report Issue Wizard
    reportPageBadge: 'मार्गदर्शित जन शिकायत पंजीकरण',
    reportPageTitle: 'जन शिकायत दर्ज करें',
    step1Tab: '1. समस्या का विवरण',
    step2Tab: '2. स्थान एवं प्रमाण',
    step3Tab: '3. रूटिंग समीक्षा एवं जमा',
    step1Heading: 'चरण 1: समस्या का विवरण दें',
    step1Sub: 'समस्या का स्पष्ट शीर्षक और विस्तृत विवरण लिखें।',
    step2Heading: 'चरण 2: घटना स्थल एवं फोटो प्रमाण',
    step2Sub: 'समस्या का सटीक स्थान बताएं और आवश्यकतानुसार फोटो संलग्न करें।',
    step3Heading: 'चरण 3: समीक्षा करें एवं दर्ज करें',
    step3Sub: 'स्वचालित विभाग आवंटन, प्राथमिकता स्कोर जांचें और सबमिट करें।',

    // Step 1 Fields
    labelTitle: 'शिकायत का मुख्य शीर्षक / सारांश *',
    phTitle: 'उदा. मुख्य सड़क पर गहरा गड्ढा या बिजली का खुला तार...',
    labelDesc: 'विस्तृत विवरण *',
    phDesc: 'समस्या क्या है, कितने दिनों से है और क्या यह सुरक्षा के लिए खतरा है...',
    btnAutoFill: 'नमूना शिकायत भरें',
    btnContinueStep2: 'स्थान एवं प्रमाण पर आगे बढ़ें',

    // Step 2 Fields
    labelLocation: 'घटना स्थल / वार्ड / इलाका *',
    phLocation: 'उदा. सेक्टर 17, सिटी पार्क के पास, भोपाल, म.प्र.',
    labelPhoto: 'समर्थन में फोटो संलग्न करें (वैकल्पिक)',
    photoDragDrop: 'फोटो अपलोड करने के लिए क्लिक करें या यहाँ खींचें',
    photoFormats: 'समर्थित प्रारूप: JPG, PNG, WEBP (अधिकतम 5MB)',
    photoRemove: 'फोटो हटाएं',
    photoSizeError: 'फ़ाइल का आकार 5MB से अधिक है।',
    photoTypeError: 'अमान्य प्रारूप। कृपया JPG, PNG या WEBP इमेज चुनें।',
    photoStorageNotice: 'फोटो स्थानीय रूप से चुनी गई है। क्लाउड स्टोरेज प्रशासक द्वारा प्रबंधित है।',
    btnBackStep1: 'विवरण पर वापस जाएं',
    btnContinueStep3: 'समीक्षा के लिए आगे बढ़ें',

    // Step 3 Fields
    summaryHeadline: 'आपकी शिकायत का सारांश',
    reviewTitle: 'शीर्षक',
    reviewLocation: 'स्थान',
    reviewDesc: 'विवरण',
    reviewPhotoAttached: 'फोटो संलग्न है',
    reviewNoPhoto: 'कोई फोटो संलग्न नहीं',
    simulationNotice: 'कीवर्ड-आधारित रूटिंग सिमुलेशन',
    simulationSub: 'यह मॉडल प्राथमिक प्राथमिकता और विभाग का अनुमान लगाता है',
    paramPriority: 'प्राथमिकता (Priority)',
    paramDuration: 'अवधि (Duration)',
    paramUrgency: 'तात्कालिकता (Urgency)',
    paramFeasibility: 'सुगमता (Feasibility)',
    scoreFooterTitle: 'कोर स्कोर (Core Score)',
    scoreFooterSub: 'समग्र प्राथमिकता स्तर (0 - 10)',
    autoDispatchTitle: 'आवंटित विभाग',
    btnBackStep2: 'स्थान पर वापस जाएं',
    btnSubmitGrievance: 'शिकायत पोर्टल पर दर्ज करें',
    btnSubmitting: 'शिकायत दर्ज हो रही है...',

    // Receipt Screen
    receiptTitle: 'शिकायत सफलतापूर्वक दर्ज व प्रेषित',
    receiptDesc: 'आपकी शिकायत को डेटाबेस में सुरक्षित रूप से दर्ज कर लिया गया है।',
    receiptTrackingId: 'ट्रैकिंग आईडी',
    receiptDepartment: 'आवंटित विभाग',
    receiptAuthority: 'प्राधिकरण कोड',
    receiptCoreScore: 'कोर स्कोर',
    btnTrackQueue: 'शिकायत की स्थिति ट्रैक करें',
    btnFileAnother: 'एक और शिकायत दर्ज करें',

    // Validation Errors
    errFillRequired: 'कृपया आगे बढ़ने से पहले सभी आवश्यक फ़ील्ड भरें।',
    errTitleRequired: 'शीर्षक आवश्यक है (कम से कम 3 अक्षर)।',
    errDescRequired: 'विवरण आवश्यक है (कम से कम 10 अक्षर)।',
    errLocationRequired: 'स्थान आवश्यक है (कम से कम 3 अक्षर)।',

    // Track Page
    trackBadge: 'महत्व एवं पंजीकरण समय के अनुसार क्रमबद्ध',
    trackTitle: 'जन शिकायतों की स्थिति जानें',
    trackSub: 'नागरिक शिकायतों को खोजें और उनकी प्रगति देखें',
    phSearch: 'ट्रैकिंग आईडी, स्थान या कीवर्ड से खोजें...',
    filterByGrade: 'रेटिंग स्टार के अनुसार फ़िल्टर करें (> 7):',
    filterCategory: 'श्रेणी (Category):',
    filterStatus: 'स्थिति (Status):',
    statusAll: 'सभी स्थितियाँ',
    statusPending: 'दर्ज / लंबित (Pending)',
    statusInProgress: 'प्रक्रियाधीन (In Progress)',
    statusResolved: 'निस्तारित (Resolved)',
    categoryAll: 'सभी श्रेणियां',
    starPriority: 'प्राथमिकता > 7',
    starDuration: 'अवधि > 7',
    starUrgency: 'तात्कालिकता > 7',
    starFeasibility: 'सुगमता > 7',
    activeFilter: 'सक्रिय',
    toggleFilter: 'फ़िल्टर',
    loadingGrievances: 'डेटाबेस से शिकायतें लोड हो रही हैं...',
    connectingDb: 'लाइव निवारण प्रणाली से संपर्क जारी...',
    failedGrievances: 'शिकायतें लोड करने में विफल',
    btnRetry: 'पुनः प्रयास करें',
    noGrievancesTitle: 'कोई शिकायत नहीं मिली',
    noGrievancesMatch: 'आपकी खोज या फ़िल्टर के अनुसार कोई शिकायत नहीं मिली।',
    noGrievancesDb: 'डेटाबेस में अभी कोई शिकायत दर्ज नहीं है। दर्ज होते ही यहाँ प्रदर्शित होगी।',
    btnResetFilters: 'सभी फ़िल्टर रीसेट करें',
    showingRecords: 'प्रदर्शित',
    ofRecords: 'कुल',
    recordsLabel: 'शिकायतें',
    btnLoadMore: 'और शिकायतें लोड करें',
    loadingMore: 'लोड हो रहा है...',

    // Complaint Card
    cardRank: 'क्रमांक #',
    cardCitizensAffected: 'प्रभावित नागरिक',
    cardCoreScoreLabel: 'कोर स्कोर',

    // Modal
    modalTitle: 'शिकायत का संपूर्ण विवरण',
    modalAuthority: 'प्राधिकरण',
    modalTracking: 'ट्रैकिंग आईडी',
    modalStatus: 'स्थिति',
    modalCreated: 'पंजीकरण समय',

    // Help & Support Page
    helpBadge: 'नागरिक सहायता एवं समाधान चार्टर',
    helpTitle: 'हम आपकी क्या सहायता कर सकते हैं?',
    helpSub: 'जानें कि जन शिकायतों का वर्गीकरण, रूटिंग और समयबद्ध निस्तारण कैसे किया जाता है।',
    contactHelplineTitle: 'राष्ट्रीय टोल-फ्री हेल्पलाइन',
    contactHelplineSub: '24x7 नागरिक कॉल सेंटर सहायता',
    contactEmailTitle: 'नोडल अपीलीय प्राधिकरण',
    contactEmailSub: 'लंबित मामलों के लिए सीधा ईमेल संपर्क',
    contactSlaTitle: 'मानक निस्तारण लक्ष्य (SLA)',
    contactSlaSub: 'मानक नगरपालिका समाधान समय-सीमा',
    contactSlaVal: '3-7 कार्य दिवस',
    faqHeading: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',

    // Feedback Form (Help & Support)
    feedbackHeading: 'प्रतिक्रिया दें या पोर्टल की समस्या बताएं',
    feedbackSub: 'गेट इट रिज़ॉल्व्ड नागरिक पोर्टल को बेहतर बनाने में हमारी मदद करें।',
    fbLabelName: 'आपका नाम (वैकल्पिक)',
    fbPhName: 'उदा. राजेश कुमार',
    fbLabelContact: 'ईमेल या मोबाइल नंबर *',
    fbPhContact: 'उदा. rajesh@example.com या 9876543210',
    fbLabelType: 'प्रतिक्रिया की श्रेणी *',
    fbTypeBug: 'पोर्टल में तकनीकी त्रुटि की रिपोर्ट करें',
    fbTypeSuggestion: 'सुविधा का सुझाव दें',
    fbTypeDept: 'विभागीय सेवा से संबंधित प्रतिक्रिया',
    fbTypeGeneral: 'सामान्य पूछताछ',
    fbLabelMessage: 'आपका संदेश / सुझाव *',
    fbPhMessage: 'कृपया समस्या या सुझाव का विस्तार से वर्णन करें...',
    btnSubmitFeedback: 'प्रतिक्रिया सबमिट करें',
    fbSuccessTitle: 'प्रतिक्रिया दर्ज कर ली गई है',
    fbSuccessMsg:
      'धन्यवाद! आपकी प्रतिक्रिया को आपके वर्तमान सत्र में मान्य व दर्ज कर लिया गया है। (नोट: सर्वर साइड फीडबैक एपीआई सक्रिय होते ही यह केंद्रीय डेटाबेस में सुरक्षित होगी)।',
    fbErrRequired: 'कृपया अपना संपर्क और संदेश (कम से कम 10 अक्षर) भरें।',

    // Footer
    footerGov: 'भारत सरकार • आवासन और शहरी कार्य मंत्रालय',
    footerRights: 'सर्वाधिकार सुरक्षित। आधिकारिक जन शिकायत निवारण पोर्टल।'
  }
};

