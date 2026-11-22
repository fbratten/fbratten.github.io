/* Berättelsens ramverk: kapitel, kamera, etiketter, rutter och släktträd för Oceanien. Händelserna
   (fynd, genetik, miljö) finns i data/events.js, byggd ur research/. Rutter är pedagogiska pilar:
   de visar en tolkning, inte exakta vägar. Status följer samma skala som händelserna: belagt
   (heldragen), antytt (streckad), omstritt (prickad). Rutterna bygger på research/archaeology_voyaging.json
   (routes) utom "austronesiskt-soderut", som byggaren lagt till ur händelsen out-of-taiwan (se kommentaren). */
(function (FA) {
  "use strict";

  FA.STORY = {
    // Publiceringsadress (release, GAC #277) och datum för källkontrollen. Visas i filmens slutskylt.
    site: { url_label: "fbratten.github.io/labs/oceanien", checked_sv: "22 november 2026", checked_en: "22 November 2026" },

    // ocean: hur mycket havsljud kapitlet får i filmen (0-1)
    chapters: [
      { from: 70000, to: 45001, ocean: 0.6, title: "Över havet till Sahul", title_en: "Across the sea to Sahul",
        lead: "Havet står 60-90 meter lägre än i dag. Sunda och Sahul är stora landmassor, men mellan dem ligger Wallacea, där varje steg kräver båt. Hur tidigt människor kom fram är omstritt.",
        lead_en: "The sea stands 60-90 meters lower than today. Sunda and Sahul are large landmasses, but between them lies Wallacea, where every step takes a boat. How early people arrived is disputed." },
      { from: 45000, to: 20001, ocean: 0.5, title: "Nära Oceanien under istiden", title_en: "Near Oceania in the Ice Age",
        lead: "Människor finns i hela Sahul och tar sig ut till Bismarckarkipelagen och Salomonöarna. Obsidian flyttas mellan öarna, ett tidigt tecken på resor och utbyte.",
        lead_en: "People live across Sahul and reach the Bismarck Archipelago and the Solomon Islands. Obsidian moves between the islands, an early sign of voyaging and exchange." },
      { from: 20000, to: 5001, ocean: 0.4, title: "Istiden slutar, odlingen börjar", title_en: "The Ice Age ends, farming begins",
        lead: "Havet stiger över 100 meter och delar Sahul i Australien och Nya Guinea. I Nya Guineas högland odlar människor tidigt, bland annat vid Kuk.",
        lead_en: "The sea rises more than 100 meters and splits Sahul into Australia and New Guinea. In the New Guinea highlands people farm early, among other places at Kuk." },
      { from: 5000, to: 3451, ocean: 0.6, title: "Ut från Taiwan", title_en: "Out of Taiwan",
        lead: "Språk och arvsmassa pekar på att förfäderna till dagens austronesiska folk sprider sig från Taiwan söderut. Någon når Marianerna över öppet hav, men när är omstritt.",
        lead_en: "Languages and genomes point to the ancestors of today's Austronesian peoples spreading south from Taiwan. Someone reaches the Mariana Islands across open sea, but when is disputed." },
      { from: 3450, to: 2751, ocean: 0.85, title: "Lapita", title_en: "Lapita",
        lead: "En ny kultur med stämplad keramik dyker upp i Bismarckarkipelagen. På några få sekler når den Vanuatu, Nya Kaledonien, Fiji, Tonga och Samoa, öar där ingen hade bott förut.",
        lead_en: "A new culture with stamped pottery appears in the Bismarck Archipelago. Within a few centuries it reaches Vanuatu, New Caledonia, Fiji, Tonga and Samoa, islands where no one had lived before." },
      { from: 2750, to: 1151, ocean: 0.7, title: "Den långa pausen", title_en: "The long pause",
        lead: "I västra Polynesien stannar resorna österut av i mer än tusen år. Under tiden tar en befolkning med papuansk härkomst över i Vanuatu, och polynesiernas blandade anor tar form.",
        lead_en: "In West Polynesia the voyages east stop for more than a thousand years. Meanwhile a population of Papuan descent takes over in Vanuatu, and the mixed ancestry of Polynesians takes shape." },
      { from: 1150, to: 751, ocean: 0.9, title: "Den stora resan österut", title_en: "The great voyage east",
        lead: "På bara några sekler nås Sällskapsöarna, Marquesas och Hawaii, tusentals kilometer över öppet hav. Varför resorna tar fart just nu är omstritt; klimat och vindar har föreslagits.",
        lead_en: "Within a few centuries the Society Islands, the Marquesas and Hawaii are reached, thousands of kilometers across open sea. Why the voyages pick up now is disputed; climate and winds have been suggested." },
      { from: 750, to: 430, ocean: 0.85, title: "Triangelns hörn och mötet med Amerika", title_en: "The corners of the triangle and the meeting with the Americas",
        lead: "Rapa Nui, Aotearoa och Chathamöarna befolkas. Sötpotatisen och arvsmassan visar att polynesier och ursprungsamerikaner möttes, men när och var är omstritt. Tidslinjen slutar år 1520, strax innan Magellan når Marianerna.",
        lead_en: "Rapa Nui, Aotearoa and the Chatham Islands are settled. The sweet potato and genomes show that Polynesians and Native Americans met, but when and where is disputed. The timeline ends in 1520, just before Magellan reaches the Mariana Islands." }
    ],

    // Berättelsekamera (BP fallande). zoom 1 = globen fyller vyn.
    camera: [
      { bp: 70000, lat: -4, lon: 124, zoom: 1.2 },
      { bp: 66000, lat: -5, lon: 126, zoom: 1.6 },
      { bp: 58000, lat: -6, lon: 131, zoom: 1.5 },
      { bp: 50000, lat: -12, lon: 136, zoom: 1.15 },
      { bp: 44000, lat: -18, lon: 140, zoom: 1.05 },
      { bp: 40000, lat: -7, lon: 148, zoom: 1.6 },
      { bp: 33000, lat: -5, lon: 152, zoom: 1.9 },
      { bp: 25000, lat: -5, lon: 150, zoom: 1.8 },
      { bp: 20000, lat: -10, lon: 136, zoom: 1.0 },
      { bp: 12000, lat: -7, lon: 140, zoom: 1.2 },
      { bp: 7500, lat: -6, lon: 144, zoom: 1.75 },
      { bp: 5400, lat: 16, lon: 124, zoom: 1.35 },
      { bp: 3700, lat: 6, lon: 140, zoom: 1.1 },
      { bp: 3420, lat: -4, lon: 151, zoom: 1.6 },
      { bp: 3050, lat: -15, lon: 167, zoom: 1.4 },
      { bp: 2870, lat: -18, lon: -178, zoom: 1.45 },
      { bp: 2650, lat: -16, lon: -176, zoom: 1.5 },
      { bp: 2200, lat: -13, lon: 176, zoom: 1.15 },
      { bp: 1200, lat: -14, lon: -165, zoom: 1.0 },
      { bp: 1000, lat: -15, lon: -156, zoom: 1.2 },
      { bp: 880, lat: 0, lon: -150, zoom: 0.95 },
      { bp: 780, lat: -20, lon: -128, zoom: 0.95 },
      { bp: 735, lat: -14, lon: -105, zoom: 0.95 },
      { bp: 680, lat: -34, lon: 178, zoom: 1.2 },
      { bp: 610, lat: -27, lon: -100, zoom: 0.85 },
      { bp: 470, lat: -38, lon: -172, zoom: 1.1 },
      { bp: 430, lat: -5, lon: 178, zoom: 0.8 }
    ],

    // Den långa pausen: ritas med motorns markering för en långvarig paus på en plats
    standstill: { from: 2800, to: 1000, lat: -16, lon: -174, radius: 8, status: "belagt", tone: "pacific",
      label_sv: "Den långa pausen", label_en: "The long pause" },

    // Kartnamn. from/to i BP styr när namnet syns; minZoom döljer små namn i översiktsvyn.
    // Sahul- och Sundanamnen följer havsnivån ungefärligt (se research/genetics_environment.json).
    labels: [
      { text: "ASIEN", text_en: "ASIA", lat: 30, lon: 104, size: 16, spacing: 6 },
      { text: "AUSTRALIEN", text_en: "AUSTRALIA", lat: -29, lon: 132, size: 16, spacing: 6 },
      { text: "NYA GUINEA", text_en: "NEW GUINEA", lat: -5.8, lon: 142, size: 12, spacing: 4 },
      { text: "SAHUL", text_en: "SAHUL", lat: -11.5, lon: 137, size: 14, spacing: 6, color: "#f6e7c4", from: 65000, to: 8000 },
      { text: "SUNDA", text_en: "SUNDA", lat: 3, lon: 108, size: 14, spacing: 6, color: "#f6e7c4", from: 65000, to: 9500 },
      { text: "WALLACEA", text_en: "WALLACEA", lat: -3.5, lon: 123, size: 11, spacing: 3, italic: true, color: "#ffe1a8" },
      { text: "TAIWAN", text_en: "TAIWAN", lat: 24.5, lon: 123.6, size: 10, spacing: 2, minZoom: 1.2 },
      { text: "NÄRA OCEANIEN", text_en: "NEAR OCEANIA", lat: -1.5, lon: 153, size: 11, spacing: 3, italic: true, color: "#bff5ea" },
      { text: "AVLÄGSNA OCEANIEN", text_en: "REMOTE OCEANIA", lat: -9, lon: 176, size: 11, spacing: 3, italic: true, color: "#bff5ea", to: 3600 },
      { text: "MIKRONESIEN", text_en: "MICRONESIA", lat: 10, lon: 152, size: 11, spacing: 3, italic: true, color: "#bff5ea", to: 3600 },
      { text: "POLYNESIEN", text_en: "POLYNESIA", lat: -12, lon: -153, size: 12, spacing: 4, italic: true, color: "#bff5ea", to: 3000 },
      { text: "STILLA HAVET", text_en: "PACIFIC OCEAN", lat: 12, lon: -165, size: 15, spacing: 7, italic: true, color: "#bcd7ff" },
      { text: "STILLA HAVET", text_en: "PACIFIC OCEAN", lat: -33, lon: -140, size: 15, spacing: 7, italic: true, color: "#bcd7ff" },
      { text: "INDISKA OCEANEN", text_en: "INDIAN OCEAN", lat: -22, lon: 88, size: 14, spacing: 6, italic: true, color: "#bcd7ff" },
      { text: "SYDAMERIKA", text_en: "SOUTH AMERICA", lat: -14, lon: -61, size: 15, spacing: 6 },
      { text: "Bismarckarkipelagen", text_en: "Bismarck Archipelago", lat: -2.6, lon: 151.5, size: 10, spacing: 1, minZoom: 1.6 },
      { text: "Salomonöarna", text_en: "Solomon Islands", lat: -8.4, lon: 159.5, size: 10, spacing: 1, minZoom: 1.6 },
      { text: "Vanuatu", text_en: "Vanuatu", lat: -15.6, lon: 170.2, size: 10, spacing: 1, minZoom: 1.6 },
      { text: "Nya Kaledonien", text_en: "New Caledonia", lat: -22.6, lon: 168.4, size: 10, spacing: 1, minZoom: 1.6 },
      { text: "Fiji", text_en: "Fiji", lat: -18.4, lon: 179.6, size: 10, spacing: 1, minZoom: 1.4 },
      { text: "Tonga", text_en: "Tonga", lat: -21.6, lon: -173.4, size: 10, spacing: 1, minZoom: 1.4 },
      { text: "Samoa", text_en: "Samoa", lat: -13.0, lon: -171.0, size: 10, spacing: 1, minZoom: 1.4 },
      { text: "Marianerna", text_en: "Mariana Islands", lat: 16, lon: 147.4, size: 10, spacing: 1, minZoom: 1.4 },
      { text: "Sällskapsöarna", text_en: "Society Islands", lat: -15.8, lon: -148.4, size: 10, spacing: 1, minZoom: 1.3 },
      { text: "Marquesas", text_en: "Marquesas", lat: -8, lon: -137.5, size: 10, spacing: 1, minZoom: 1.3 },
      { text: "Hawaii", text_en: "Hawaii", lat: 23, lon: -156.5, size: 11, spacing: 1 },
      { text: "Rapa Nui", text_en: "Rapa Nui", lat: -25.6, lon: -107.6, size: 11, spacing: 1 },
      { text: "Aotearoa", text_en: "Aotearoa", lat: -38.5, lon: 178.8, size: 11, spacing: 1 },
      { text: "Chathamöarna", text_en: "Chatham Islands", lat: -42.6, lon: -174.8, size: 10, spacing: 1, minZoom: 1.3 }
    ],

    // Rutter. tone: human | genetic | contested | pacific. kind används för filtrering mot händelsetyperna.
    // Status efter den blinda granskningen: vägarna inom Östpolynesien är rekonstruktioner (antytt), och mötet
    // med Amerika är omstritt (research/review/COMPARISON.md, S7-S9).
    // Waypoints med bp styr tempot längs rutten.
    routes: [
      { id: "sunda-sahul", label_sv: "Över Wallacea", label_en: "Across Wallacea", tone: "human", kind: "arkeologi", status: "antytt",
        start: 69000, end: 61000, fade: 30000, labelAt: 0.35,
        waypoints: [{ lat: 0.5, lon: 116.5 }, { lat: -4.9, lon: 122.6 }, { lat: -3.2, lon: 129.0 }, { lat: -0.25, lon: 130.85 },
          { lat: -1.5, lon: 133.0 }, { lat: -6.5, lon: 135.0 }, { lat: -12.5, lon: 132.9 }] },
      { id: "nara-oceanien", label_sv: "Ut till Nära Oceanien", label_en: "Out to Near Oceania", tone: "human", kind: "arkeologi", status: "belagt",
        start: 44000, end: 32000, fade: 20000, labelAt: 0.5,
        waypoints: [{ lat: -6.4, lon: 147.6, bp: 44000 }, { lat: -5.35, lon: 150.1 }, { lat: -3.6, lon: 152.0, bp: 40000 }, { lat: -5.34, lon: 154.69, bp: 32000 }] },
      // Tillagd av byggaren: forskningen saknade en rutt söderut från Taiwan (ingen öppnad källa beskrev vägen).
      // Pilen bygger på händelsen out-of-taiwan och är därför genetisk, förenklad och antydd.
      { id: "austronesiskt-soderut", label_sv: "Söderut från Taiwan (förenklat)", label_en: "South from Taiwan (simplified)", tone: "genetic", kind: "genetik", status: "antytt",
        start: 5200, end: 3500, fade: 2500, labelAt: 0.3,
        waypoints: [{ lat: 23.7, lon: 121.0 }, { lat: 17.6, lon: 121.7 }, { lat: 10, lon: 124.5 }, { lat: 1.5, lon: 125.0 },
          { lat: -1.5, lon: 128.5 }, { lat: -1.5, lon: 138.0 }, { lat: -2.5, lon: 149.0 }] },
      { id: "taiwan-marianerna", label_sv: "Till Marianerna", label_en: "To the Marianas", tone: "pacific", kind: "arkeologi", status: "antytt",
        start: 3700, end: 3480, fade: 1500, labelAt: 0.6,
        waypoints: [{ lat: 17.6, lon: 121.7 }, { lat: 15.5, lon: 133 }, { lat: 13.65, lon: 144.86 }] },
      { id: "lapita-spread", label_sv: "Lapita", label_en: "Lapita", tone: "pacific", kind: "arkeologi", status: "belagt",
        start: 3400, end: 2800, fade: 1500, labelAt: 0.35,
        waypoints: [{ lat: -1.5, lon: 149.7, bp: 3400 }, { lat: -10.7, lon: 165.9, bp: 3050 }, { lat: -17.78, lon: 168.4, bp: 2950 },
          { lat: -18.2, lon: 177.7, bp: 2880 }, { lat: -21.1, lon: -175.1, bp: 2838 }, { lat: -13.83, lon: -172.03, bp: 2800 }] },
      { id: "lapita-kaledonien", tone: "pacific", kind: "arkeologi", status: "belagt",
        start: 3050, end: 2990, fade: 1500,
        waypoints: [{ lat: -10.7, lon: 165.9 }, { lat: -17, lon: 166.5 }, { lat: -21.05, lon: 164.79 }] },
      { id: "mot-sallskapsoarna", label_sv: "Mot östra Polynesien", label_en: "Toward East Polynesia", tone: "pacific", kind: "arkeologi", status: "antytt",
        start: 1000, end: 925, fade: 500, labelAt: 0.5,
        waypoints: [{ lat: -13.83, lon: -172.03 }, { lat: -15.5, lon: -162 }, { lat: -16.8, lon: -151.4 }] },
      { id: "ostpolynesien-norr", tone: "pacific", kind: "arkeologi", status: "antytt",
        start: 920, end: 800, fade: 450,
        waypoints: [{ lat: -16.8, lon: -151.4 }, { lat: -8.9, lon: -140.0 }, { lat: 6, lon: -148 }, { lat: 19.6, lon: -155.5 }] },
      { id: "till-rapa-nui", tone: "pacific", kind: "arkeologi", status: "antytt",
        start: 830, end: 750, fade: 450,
        waypoints: [{ lat: -16.8, lon: -151.4 }, { lat: -23.12, lon: -134.97 }, { lat: -27.12, lon: -109.37 }] },
      { id: "mote-amerika", label_sv: "Möte med Amerika", label_en: "Meeting the Americas", tone: "contested", kind: "kontakt", status: "omstritt",
        start: 770, end: 735, fade: 400, labelAt: 0.5,
        waypoints: [{ lat: -8.9, lon: -140.0 }, { lat: -7, lon: -110 }, { lat: -5.0, lon: -81.0 }] },
      { id: "till-aotearoa", tone: "pacific", kind: "arkeologi", status: "antytt",
        start: 760, end: 670, fade: 450,
        waypoints: [{ lat: -16.8, lon: -151.4 }, { lat: -20.0, lon: -158.1 }, { lat: -30, lon: -172 }, { lat: -41.5, lon: 174.07 }] },
      { id: "till-rekohu", tone: "pacific", kind: "arkeologi", status: "antytt",
        start: 520, end: 450, fade: 300,
        waypoints: [{ lat: -41.5, lon: 174.07 }, { lat: -43.5, lon: 179.5 }, { lat: -43.95, lon: -176.55 }] }
    ]
  };

  /* Genetiskt släktträd ur research/genetics_environment.json (genetic_tree). Rader uppifrån och ned.
     Där forskningen saknar datering (split_bp null) visar byggaren linjen från en rimlig tidpunkt och
     säger det i anteckningen. Status efter den blinda granskningen (research/review/COMPARISON.md). */
  FA.TREE = {
    lineages: [
      { id: "denisovans", row: 0, label: "Denisovaner", label_en: "Denisovans", from: 70000, to: 25000, color: "#9aa7bf", status: "belagt",
        endLabel: "slutet okänt", endLabel_en: "end unknown",
        note: "En forntida människoform. När den försvann är okänt; spår finns kvar i arvsmassan.",
        note_en: "An archaic human group. When it disappeared is unknown; traces remain in genomes." },
      { id: "aboriginal-australians", row: 1, parent: "sahul-ancestors", label: "Australiska ursprungsfolk", label_en: "Aboriginal Australians", from: 37000, to: 430, color: "#ffb44d", status: "antytt",
        note: "Skiljs från papuanerna för ca 40 000-25 000 år sedan.", note_en: "Diverge from Papuans about 40,000-25,000 years ago." },
      { id: "sahul-ancestors", row: 2, parent: "non-africans", label: "Sahuls första folk", label_en: "First peoples of Sahul", from: 60000, to: 37000, color: "#ffcf8a", status: "antytt",
        note: "Skiljs från andra eurasier för ca 72 000-51 000 år sedan.", note_en: "Diverge from other Eurasians about 72,000-51,000 years ago." },
      { id: "papuans", row: 3, parent: "sahul-ancestors", label: "Papuaner", label_en: "Papuans", from: 37000, to: 430, color: "#ff9d6e", status: "antytt",
        note: "Nya Guinea och Nära Oceanien.", note_en: "New Guinea and Near Oceania." },
      { id: "non-africans", row: 4, label: "Människor utanför Afrika", label_en: "People outside Africa", from: 70000, to: 60000, color: "#d9b77e", status: "belagt",
        note: "Gemensamma förfäder till folken i Asien och Sahul.", note_en: "Shared ancestors of the peoples of Asia and Sahul." },
      { id: "ni-vanuatu", row: 5, parent: "lapita-first-remote", label: "Vanuatus folk", label_en: "People of Vanuatu", from: 2500, to: 430, color: "#7fd1b0", status: "belagt",
        note: "Mest papuanska anor sedan ca 2 300 år sedan.", note_en: "Mostly Papuan ancestry since about 2,300 years ago." },
      { id: "lapita-first-remote", row: 6, parent: "austronesian-ancestors", label: "De första i Avlägsna Oceanien (Lapita)", label_en: "First people of Remote Oceania (Lapita)", from: 3200, to: 2500, color: "#52e3c6", status: "belagt",
        note: "Daterade efter gravarnas ålder, inte genetiskt.", note_en: "Dated by the age of the graves, not genetically." },
      { id: "austronesian-ancestors", row: 7, parent: "east-asians", label: "Austronesiska förfäder (Taiwan)", label_en: "Austronesian ancestors (Taiwan)", from: 6000, to: 3200, color: "#9fdcff", status: "belagt",
        note: "Linjen börjar här för läsbarhet; forskningen anger ingen genetisk datering.", note_en: "The line starts here for readability; the research gives no genetic date." },
      { id: "west-polynesians", row: 8, parent: "lapita-first-remote", label: "Västpolynesier", label_en: "West Polynesians", from: 2800, to: 430, color: "#3fc7ae", status: "antytt",
        note: "Tonga och Samoa. Får papuanska anor under den långa pausen.", note_en: "Tonga and Samoa. Gain Papuan ancestry during the long pause." },
      { id: "east-polynesians", row: 9, parent: "west-polynesians", label: "Östpolynesier", label_en: "East Polynesians", from: 1120, to: 430, color: "#bff5ea", status: "antytt",
        note: "Skiljs ut ca 1 150-1 050 år sedan.", note_en: "Split off about 1,150-1,050 years ago." },
      { id: "rapanui", row: 10, parent: "east-polynesians", label: "Rapanui", label_en: "Rapanui", from: 740, to: 430, color: "#e6fff8", status: "antytt",
        note: "Rapa Nuis folk.", note_en: "The people of Rapa Nui." },
      { id: "east-asians", row: 11, parent: "non-africans", label: "Östasiater", label_en: "East Asians", from: 60000, to: 430, color: "#b7c2d8", status: "belagt",
        note: "Linjen börjar vid samma tid som Sahuls linje, för läsbarhet.", note_en: "The line starts at the same time as Sahul's, for readability." },
      { id: "native-americans", row: 12, parent: "east-asians", label: "Ursprungsamerikaner", label_en: "Native Americans", from: 36000, to: 430, color: "#c4a3ff", status: "belagt",
        note: "Förenklat: anorna kommer till största delen från östasiater, med ett inslag från forntida nordeurasier. Skiljs från östasiater kring 36 000 år sedan, enligt visning 1 (De första amerikanerna).",
        note_en: "Simplified: most of the ancestry comes from East Asians, with a share from Ancient North Eurasians. Diverge from East Asians around 36,000 years ago, per exhibit 1 (The First Americans)." }
    ],
    admixtures: [
      { from: "denisovans", to: "sahul-ancestors", bp: 46000, status: "belagt", label: "denisovanarv", label_en: "Denisovan ancestry" },
      { from: "denisovans", to: "papuans", bp: 25000, status: "antytt", label: "senare omgång", label_en: "a later pulse" },
      { from: "papuans", to: "ni-vanuatu", bp: 2500, status: "belagt", label: "utbyte", label_en: "turnover" },
      { from: "papuans", to: "west-polynesians", bp: 2000, status: "belagt", label: "papuanska anor (tid osäker)", label_en: "Papuan ancestry (time uncertain)" },
      { from: "native-americans", to: "east-polynesians", bp: 750, status: "omstritt", label: "ca år 1200", label_en: "c. 1200 CE" },
      { from: "native-americans", to: "rapanui", bp: 600, status: "antytt", label: "ca 10 %", label_en: "c. 10%" }
    ]
  };
})(window.FA = window.FA || {});
