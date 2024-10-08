// ==UserScript==
// @name DO Genie Assistant
// @version 44.0
// @namespace https://github.com/edunogueira/DOGenieAssistant/
// @description dugout-online genie assistant
// @author n_edu (clubid/112411), mini18 (clubid/99440), lumfurt (clubid/106059), Gleybe (clubid/113526), ernestofv01 (clubid/112729), allandagama (clubid/113643)
// @icon https://www.google.com/s2/favicons?domain=dugout-online.com
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js
// @include http*dugout-online.com/*
// @include https://www.dugout-online.com/*

// ==/UserScript==
//page select ----------------------------------------------//
var page = document.URL;
var configs = getStorage(localStorage.getItem("DOGenieAssistant.configs")) || {};
var soundConfig = getSoundStorage(localStorage.getItem("DOGenieAssistant.soundConfig")) || {};
var scores = "";
function checkAndExecute(config, func) {
    if ((config) || (typeof config === 'undefined')) {
        func();
    }
}

checkAndExecute(configs["PAGE_TITLE"], pageTitle);
checkAndExecute(configs["DROPDDOWN_MENU"], dropdownMenu);
checkAndExecute(configs["SECONDARY_CLOCK"], secondaryClock);
checkAndExecute(configs["LINKS"], links);
if (document.forms['messageEditor']) {
    checkAndExecute(configs["WRAP_TEXT"], wrapText);
}
if (page.includes('/home/none/')) {
    configMenu();
    configSound();
    defaultConfigStorage();
    defaultSoundStorage();
    clearMatchStorage();
    clearPlayerImages();

    checkAndExecute(configs["TEAM_LINK"], teamLink);
    checkAndExecute(configs["GET_SPONSORS"], getSponsors);
} else if (page.includes('/search_coaches/none/')) {
    checkAndExecute(configs["COACHES_WAGE"], coachesWage);
    checkAndExecute(storedFilters["STORED_FILTERS"], storedFilters);
} else if (page.includes('/clubinfo/none/clubid/')) {
    checkAndExecute(configs["READ_RESUME"], readResume);
} else if (page.includes('/clubinfo/none/')) {
    checkAndExecute(configs["SCOUT_BUTTON"], scoutButton);
} else if (page.includes('/players/details/')|| page.includes('/players_nt/details/')) {
    playerDetails();
    checkAndExecute(configs["BID_BUTTON"], bidButton);
    checkAndExecute(configs["BID_LOCAL_TIME"], bidLocalTime);
    checkAndExecute(configs["PLAYER_IMAGE"], playerImage);
    checkAndExecute(configs["SEND_PRO_SCOUT"], sendProScout);
} else if (page.includes('/players/none/') || page.includes('/players_nt/none/')) {
    checkAndExecute(configs["SQUAD_DETAILS"], squadDetails);
    checkAndExecute(configs["SQUAD_FILTERS"], squadFilters);
    checkAndExecute(configs["NATIONAL_LINK"], nationalLink);
} else if (page.includes('/tactics/none/') || page.includes('/tactics_youth/none/') || page.includes('/tactics_nt/none/')) {
    checkAndExecute(configs["TACTICS_DETAILS"], tacticsDetails);
    checkAndExecute(configs["LOAD_TACTICS"], loadTactics);
} else if (page.includes('/players/spreadsheet/')) {
    checkAndExecute(configs["SPREADSHEET_SQUAD"], function() { doTable('.forumline'); });
} else if (page.includes('/game/none/gameid/')) {
    checkAndExecute(soundConfig["MATCH_SOUND"], matchSound);
    checkAndExecute(configs["MATCH_NAMES"], matchNames);
    checkAndExecute(configs["MATCH_SCORE"], matchScore);
} else if (page.match("/search_players|/search_transfers|/search_clubs|/search_coaches|/national_teams|/search_physios")) {
    checkAndExecute(storedFilters["STORED_FILTERS"], storedFilters);
} else if (page.match("/training/none")) {
    checkAndExecute(configs["HIDE_TRAINING_REPORT"], hideTrainingReport);
    checkAndExecute(configs["COACH_EFFECTIVENESS"], coachEffectiveness);
} else if (page.match("/settings/none")) {
    importExport();
} else if (page.match("/competitions/")) {
    checkAndExecute(configs["AUTO_SCORE"], autoScore);
    if (page.match("/competitions/none")) {
        if (!page.match("/subpage/")) {
            checkAndExecute(configs["GOALS_DIFFERENCE"], goalsDifference);
        }
    }
}

//helper //----------------------------------------------//
function serverTime() {
    const d = new Date();
    const time = `${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}`;
    $('#servertime2').text(time);
}

function addZero(i) {
    return i < 10 ? "0" + i : i;
}

function applyStyle(css) {
    const head = document.head || document.getElementsByTagName('head')[0];

    if (head) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }
}

function getExp() {
    return $('div[title]')
        .map(function() {
        var titleString = $(this).attr('title');
        return /^\d+ XP$/.test(titleString) ? titleString : null;
    })
        .get();
}

function getPos() {
    var posArray = Array.from({ length: 10 }, function() { return "0"; });

    var mainDiv = document.querySelector('img[src*="positions-field"]').parentNode;

    var positions = [
        { top: "69px", left: "10px", index: 0 }, // GK
        { top: "20px", left: "40px", index: 1 }, // DL
        { top: "69px", left: "40px", index: 2 }, // DC
        { top: "117px", left: "40px", index: 3 }, // DR
        { top: "20px", left: "108px", index: 4 }, // ML
        { top: "69px", left: "108px", index: 5 }, // MC
        { top: "117px", left: "108px", index: 6 }, // MR
        { top: "20px", left: "185px", index: 7 }, // FL
        { top: "69px", left: "185px", index: 8 }, // FC
        { top: "117px", left: "185px", index: 9 } // FR
    ];

    positions.forEach(function (pos) {
        var posDiv = Array.from(mainDiv.querySelectorAll('div[style*="background"]')).find(function (div) {
            return div.style.top === pos.top && div.style.left === pos.left;
        });

        if (posDiv) {
            var img = posDiv.style.background;
            var num = img.substring(img.indexOf("positions-") + "positions-".length, img.indexOf(".png"));
            posArray[pos.index] = num;
        }
    });

    return posArray;
}

function getOPS(data) {
    var ops = [];
    var positions = [
        [0, 5, 10, 15, 13],
        [16, 6, 1, 15, 13],
        [6, 11, 1, 15, 13],
        [16, 6, 1, 15, 13],
        [16, 17, 7, 2, 13],
        [12, 17, 7, 2, 13],
        [16, 17, 7, 2, 13],
        [3, 8, 17, 16, 13],
        [3, 8, 17, 11, 13],
        [3, 8, 17, 16, 13],
        [1, 6, 7, 2, 13],
        [12, 2, 7, 3, 8]
    ];

    ops['pos'] = 0;

    for (var i = 0; i < positions.length; ++i) {
        ops[i] = positions[i].reduce(function(sum, index) {
            return sum + data[index];
        }, 0);

        if (isNaN(ops[i])) {
            ops[i] = 0;
        }

        if (ops[i] >= ops[ops['pos']]) {
            ops['pos'] = i;
        }
    }

    return ops;
}

function doTable(selector) {
    $(selector + ' tr:first td').wrapInner('<div />').find('div').unwrap().wrap('<th/>');
    let header = $(selector + " .table_top_row:first").clone();
    $(selector + " .table_top_row:first").remove();
    $(selector + " tbody:first").before('<thead></thead>');
    $(selector + " thead:first").append(header);
    let order = $(selector + ' .table_top_row th').size() - 1;
    if ((configs["SQUAD_HIGH"]) || (typeof configs["SQUAD_HIGH"] === 'undefined')) {
        order = $(selector + ' .table_top_row th').size() - 2;
    }

    if ((configs["SQUAD_FILTERS"]) || (typeof configs["SQUAD_FILTERS"] === 'undefined')) {
        $(selector).dataTable({
            "searching": true,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bInfo": false,
            "bAutoWidth": false,
            "order": [
                [order, "desc"]
            ]
        });
    } else {
        $(selector).dataTable({
            "searching": false,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bInfo": false,
            "bAutoWidth": false,
            "order": [
                [order, "desc"]
            ]
        });
    }
}

//features //----------------------------------------------//
function playerDetails() {
    let attrText = '';
    var data = Array();

    $("#main-1 table tr").each(function(i, v) {
        $(this).children('td').each(function(ii, vv) {
            if ($.isNumeric($(this).text())) {
                data.push(parseInt($(this).text()));
            }
        });
    });
    var ops = getOPS(data);
    var position = getPos();
    var natPos = 0;

    for (var i = 0; i < position.length; ++i) {
        if (position[i] == 1) {
            natPos = i;
        }
    }
    if (ops['pos'] !== natPos) {
        attrText = ' @ OPS ' + ops[natPos] + '/' + ops[ops['pos']] + '*';
    } else {
        attrText = ' @ OPS ' + ops[natPos];
    }

    const exp = getExp();
    const playerName = $('.player_name').text();

    if (configs["PLAYER_OPS_ID"] !== "") {
        $('.player_id_txt').text($('.player_id_txt').text() + attrText);
    }

    if (configs["PLAYER_OPS_NAME"] !== "") {
        $('.player_name').text($('.player_name').text() + attrText);
        $('.player_id_txt').css({
            'position': 'absolute',
            'right': '30px'
        });
    }
    const expText = ' | ' + exp;
    if (configs["PLAYER_EXP"] !== "") {
        if (configs["PLAYER_OPS_NAME"] !== "") {
            $('.player_name').text($('.player_name').text() + expText);
        }

        if (configs["PLAYER_OPS_ID"] !== "") {
            $('.player_id_txt').text($('.player_id_txt').text() + expText);
        }
    }

    if (configs["PAGE_TITLE"] !== "") {
        $(document).prop('title', playerName + attrText + expText);
    }
}

function squadDetails() {
    $(".forumline .table_top_row").each(function() {
        const headerRow = $(this).last();
        headerRow.append('<td align="center" width="20" title="Original Position Skills" class="tableHeader">OPS</td>');
        if (configs["SQUAD_HIGH"] !== "") {
            headerRow.append('<td align="center" width="20" title="Best Original Position Skills" class="tableHeader">HIGH</td>');
        }
    });

    $(".forumline [class*=matches_row]").each(function() {
        const data = Array();
        let count = 0;
        $(this).find(".tableHeader").remove();

        $(this).find("tr").each(function() {
            $(this).children('td').each(function() {
                if ($.isNumeric($(this).text())) {
                    data.push(parseInt($(this).text()));
                } else {
                    count++;
                }
            });
        });

        if (data.length > 0) {
            const position = $(this).find(" [class*=_icon]").text();
            const ops = getOPS(data);
            const natPos = getPositionIndex(position);

            $(this).last().append('<td align="center"><span class="tableText">' + ops[natPos] + '</span></td>');

            if (configs["SQUAD_HIGH"] !== "") {
                const highOps = ops[ops['pos']];
                const cellText = highOps > ops[natPos] ? '<strong>' + highOps + '</strong>' : highOps;
                $(this).last().append('<td align="center"><span class="tableText">' + cellText + '</span></td>');
            }
        } else if (count > 1) {
            $(this).last().append('<td align="center"><span class="tableText">0</span></td>');
            if (configs["SQUAD_HIGH"] !== "") {
                $(this).last().append('<td align="center"><span class="tableText">0</span></td>');
            }
        }
    });
    var tables = document.querySelectorAll("[class=forumline]");
    tables[0].classList.add("gks");
    tables[1].classList.add("dcs");
    tables[2].classList.add("mcs");
    tables[3].classList.add("pls");
    doTable('.forumline.gks');
    doTable('.forumline.dcs');
    doTable('.forumline.mcs');
    doTable('.forumline.pls');
}

function squadFilters () {
    $("#top_positions").before('<table class="inputs"><tbody><tr><td>Min Age</td><td><input type="search" id="minAge" name="minAge"></td><td>Min Rat</td><td><input type="search" id="minRat" name="minRat"></td><td>Min OPS</td><td><input type="search" id="minOPS" name="minOPS"></td><td><button id="clearButton" onclick="">Clear Fields</button></td></tr><tr><td>Max Age</td><td><input type="search" id="maxAge" name="maxAge"></td><td>Max Rat</td><td><input type="search" id="maxRat" name="maxRat"></td><td>Max OPS</td><td><input type="search" id="maxOPS" name="maxOPS"></td></tr></tbody></table>');

    $('#clearButton').on('click', function() {
        $('input[type="search"]').val('').change();;
        $('.forumline').DataTable().search('').draw();
    });

    const inputIds = ["minAge", "maxAge", "minRat", "maxRat", "minOPS", "maxOPS"];
    const inputs = inputIds.map(id => document.querySelector(`#${id}`));
    const i = ($('.top_positions').length) ? 1 : 0;
    DataTable.ext.search.push(function (settings, data, dataIndex) {
        const [minA, maxA, age, minR, maxR, rat, minO, maxO, ops] = [
            parseInt(inputs[0].value, 10), parseInt(inputs[1].value, 10),
            parseFloat(data[3 + i]) || 0,
            parseFloat(inputs[2].value) || 0, parseFloat(inputs[3].value) || Number.POSITIVE_INFINITY,
            parseFloat(data[5 + i]) || 0,
            parseFloat(inputs[4].value) || 0, parseFloat(inputs[5].value) || Number.POSITIVE_INFINITY,
            parseFloat(data[6 + i]) || 0
        ];

        if (
            (isNaN(minA) || minA <= age) &&
            (isNaN(maxA) || age <= maxA) &&
            (isNaN(minR) || minR <= rat) &&
            (isNaN(maxR) || rat <= maxR) &&
            (isNaN(minO) || minO <= ops) &&
            (isNaN(maxO) || ops <= maxO)
        ) {
            return true;
        }

        return false;
    });

    inputs.forEach(input => {
        input.addEventListener('input', function () {
            $('.forumline').DataTable().draw();
        });
    });
}

function getPositionIndex(position) {
    switch (position) {
        case "GK": return 0;
        case "DL": return 1;
        case "DC": return 2;
        case "DR": return 3;
        case "ML": return 4;
        case "MC": return 5;
        case "MR": return 6;
        case "FL": return 7;
        case "FC": return 8;
        case "FR": return 9;
        default: return 0;
    }
}

function tacticsDetails() {
    $(document).ready(function() {
        $('#agression_id').css('width', '99px');
    });
    var newAgg = $('<input>').attr({
        type: 'text',
        id: 'newAgg',
        placeholder: 'Agg',
        onmousedown: "$('#agression_id').val($(this).val());showAgression()" ,
        onchange: "$('#agression_id').val($(this).val());showAgression()" ,
        oninput: "$('#agression_id').val($(this).val());showAgression()" ,
        onkeypress: "$('#agression_id').val($(this).val());showAgression()",
        onmouseup:"$('#agression_id').val($(this).val());showAgression()" ,
        onclick:"$('#agression_id').val($(this).val());showAgression()"
    }).css('width', '23px');

    newAgg.val($('#agression_id').val());
    $('#agression_id').on('input', function() {
        $('#newAgg').val($(this).val());
    });

    $('#agression_id').before(newAgg);

    $('td').css('color', 'unset');

    var players = $("#capitan_sel > option").map(function() {
        return this.value;
    }).get();

    var subs = $("#sub_with > option").map(function() {
        return this.value;
    }).get();

    $(".player").each(function() {
        var $parentRow = $(this).closest('tr');
        var playerId = $(this).attr('rel').split('|')[0];
        var isCaptain = players.includes(playerId);
        var isSub = subs.includes(playerId);

        if (isCaptain) {
            $parentRow.css({
                'text-decoration': 'underline',
                'font-weight': 'bold'
            });
        }

        if (isSub) {
            $parentRow.css({
                'font-weight': 'bold',
                'color': 'blue'
            });
            $(this).css('color', 'blue');
        }

        let data = Array();
        let i =0;
        $("#" + playerId + " table tr").each(function() {
            $(this).children('td').each(function() {
                if ($.isNumeric($(this).text())) {
                    data.push(parseInt($(this).text()));
                    i++;
                } else if (i == 21) {
                    $(this).append("OPS");
                    $(this).css("font-size", "12px");
                    i++;
                } else if (i == 22) {
                    $(this).append("0");

                    $(this).css({
                        "font-size": "12px",
                        "font-weight": "bold"
                    });
                    $(this).addClass("ops");
                    i++;
                }
            });
        });

        if (data.length > 0) {
            var array = $(this).parent().next().map(function() {
                return $.trim($(this).text());
            }).get();
            var position = array[0];
            var ops = 0;

            if (position === "GK") {
                ops = (data[0] + data[5] + data[10] + data[15] + data[13]);
            } else if (position === "DC") {
                ops = (data[6] + data[11] + data[1] + data[15] + data[13]);
            } else if (position === "DL" || position === "DR") {
                ops = (data[16] + data[6] + data[1] + data[15] + data[13]);
            } else if (position === "ML" || position === "MR") {
                ops = (data[16] + data[17] + data[7] + data[2] + data[13]);
            } else if (position === "MC") {
                ops = (data[12] + data[17] + data[7] + data[2] + data[13]);
            } else if (position === "FL" || position === "FR") {
                ops = (data[3] + data[8] + data[17] + data[16] + data[13]);
            } else if (position === "FC") {
                ops = (data[3] + data[8] + data[17] + data[11] + data[13]);
            }

            $("#" + playerId + " .ops").text(ops);
        }
    });
}

function secondaryClock() {
    $('#footer').append('<div class="time_display" id="servertime2" style="top: 12px;border:1px solid #fff"></div>');
    setInterval(serverTime, 1000);
}

function getLanguage() {
    let settingsTitle = 'en';
    if (document.querySelector(".settings_button")) {
        settingsTitle = document.querySelector(".settings_button").title;
    }
    const languages = {
        Postavke: "bh",
        Settings: "en",
        Configuraciones: "es",
        Impostazioni: "it",
        Instellingen: "nl",
        Configurações: "br",
        Setări: "ro",
        Nastavitve: "sl",
        Ayarlar: "tr",
        설정: "ko",
    };
    return languages[settingsTitle];
};

function getTranslation() {
    return {
        bid: {
            en: "Bid",
            br: "Oferta",
            es: "Oferta",
            it: "Offerta",
            nl: "Bod",
            ro: "Ofertă",
            sl: "Ponudba",
            tr: "Teklif",
            ko: "입찰",
            bh: "Ponuda"
        },
        home_home: {
            en: "Home",
            br: "Início",
            es: "Inicio",
            it: "Home",
            nl: "Thuis",
            ro: "Acasă",
            sl: "Domov",
            tr: "Anasayfa",
            ko: "홈",
            bh: "Početna"
        },
        home_news: {
            en: "News",
            br: "Notícias",
            es: "Noticias",
            it: "Notizie",
            nl: "Nieuws",
            ro: "Știri",
            sl: "Novice",
            tr: "Haberler",
            ko: "뉴스",
            bh: "Vijesti"
        },
        home_rules: {
            en: "Rules",
            br: "Regras",
            es: "Reglas",
            it: "Regole",
            nl: "Regels",
            ro: "Reguli",
            sl: "Pravila",
            tr: "Kurallar",
            ko: "규칙",
            bh: "Pravila"
        },
        home_help: {
            en: "Help",
            br: "Ajuda",
            es: "Ayuda",
            it: "Aiuto",
            nl: "Hulp",
            ro: "Ajutor",
            sl: "Pomoč",
            tr: "Yardım",
            ko: "도움말",
            bh: "Pomoć"
        },
        club_info: {
            en: "Info",
            br: "Informações",
            es: "Información",
            it: "Informazioni",
            nl: "Info",
            ro: "Informații",
            sl: "Informacije",
            tr: "Bilgi",
            ko: "정보",
            bh: "Informacije"
        },
        club_bids: {
            en: "Bids",
            br: "Ofertas",
            es: "Ofertas",
            it: "Offerte",
            nl: "Biedingen",
            ro: "Oferte",
            sl: "Ponudbe",
            tr: "Teklifler",
            ko: "입찰",
            bh: "Ponude"
        },
        club_transfers: {
            en: "Transfers",
            br: "Transferências",
            es: "Transferencias",
            it: "Trasferimenti",
            nl: "Transfers",
            ro: "Transferuri",
            sl: "Prenosi",
            tr: "Transferler",
            ko: "이적",
            bh: "Transferi"
        },
        club_players: {
            en: "Players",
            br: "Jogadores",
            es: "Jugadores",
            it: "Giocatori",
            nl: "Spelers",
            ro: "Jucători",
            sl: "Igralci",
            tr: "Oyuncular",
            ko: "선수들",
            bh: "Igrači"
        },
        club_players_youth: {
            en: "Players (Youth)",
            br: "Jogadores (Juvenil)",
            es: "Jugadores (Juvenil)",
            it: "Giocatori (Giovani)",
            nl: "Jeugdspelers",
            ro: "Jucători (Tineret)",
            sl: "Igralci (Mladina)",
            tr: "Oyuncular (Genç)",
            ko: "선수들 (청소년)",
            bh: "Igrači (mladi)"
        },
        scout_report: {
            en: "Scout Report",
            br: "Relatório do Espião",
            es: "Informe del Explorador",
            it: "Rapporto dell'Esperto",
            nl: "Scout Rapport",
            ro: "Raport de Spionaj",
            sl: "Poročilo Izvida",
            tr: "Casus Raporu",
            ko: "스카우트 보고서",
            bh: "Izvještaj skauta"
        },
        club_staff: {
            en: "Staff",
            br: "Comissão Técnica",
            es: "Personal",
            it: "Personale",
            nl: "Personeel",
            ro: "Staff",
            sl: "Osebje",
            tr: "Personel",
            ko: "스태프",
            bh: "Osoblje"
        },
        club_settings: {
            en: "Settings",
            br: "Configurações",
            es: "Ajustes",
            it: "Impostazioni",
            nl: "Instellingen",
            ro: "Setări",
            sl: "Nastavitve",
            tr: "Ayarlar",
            ko: "설정",
            bh: "Postavke"
        },
        players_nt: {
            en: "Players",
            br: "Jogadores",
            es: "Jugadores",
            it: "Giocatori",
            nl: "Spelers",
            ro: "Jucători",
            sl: "Igralci",
            tr: "Oyuncular",
            ko: "선수들",
            bh: "Igrači"
        },
        tactics_nt: {
            en: "Tactics",
            br: "Táticas",
            es: "Tácticas",
            it: "Tattiche",
            nl: "Tactieken",
            ro: "Tactică",
            sl: "Taktika",
            tr: "Taktikler",
            ko: "전술",
            bh: "Taktike"
        },
        management_finances: {
            en: "Finances",
            br: "Finanças",
            es: "Finanzas",
            it: "Finanze",
            nl: "Financiën",
            ro: "Finanțe",
            sl: "Finance",
            tr: "Finans",
            ko: "재무",
            bh: "Finansije"
        },
        management_stadium: {
            en: "Stadium",
            br: "Estádio",
            es: "Estadio",
            it: "Stadio",
            nl: "Stadion",
            ro: "Stadion",
            sl: "Stadion",
            tr: "Stadyum",
            ko: "경기장",
            bh: "Stadion"
        },
        management_facilities: {
            en: "Facilities",
            br: "Instalações",
            es: "Instalaciones",
            it: "Strutture",
            nl: "Faciliteiten",
            ro: "Facilități",
            sl: "Objekti",
            tr: "Tesisler",
            ko: "시설",
            bh: "Objekti"
        },
        management_sponsors: {
            en: "Sponsors",
            br: "Patrocinadores",
            es: "Patrocinadores",
            it: "Sponsor",
            nl: "Sponsors",
            ro: "Sponsori",
            sl: "Sponzorji",
            tr: "Sponsorlar",
            ko: "후원사",
            bh: "Pokrovitelji"
        },
        management_calendar: {
            en: "Calendar",
            br: "Calendário",
            es: "Calendario",
            it: "Calendario",
            nl: "Kalender",
            ro: "Calendar",
            sl: "Koledar",
            tr: "Takvim",
            ko: "일정",
            bh: "Kalendar"
        },
        tactics_fiest: {
            en: "Tactics",
            br: "Táticas",
            es: "Tácticas",
            it: "Tattiche",
            nl: "Tactiek",
            ro: "Tactici",
            sl: "Taktike",
            tr: "Taktikler",
            ko: "전술",
            bh: "Taktike"
        },
        tactics_youth: {
            en: "Tactics (youth)",
            br: "Táticas (juvenil)",
            es: "Tácticas (juveniles)",
            it: "Tattiche (giovanili)",
            nl: "Tactiek (jeugd)",
            ro: "Tactici (tineret)",
            sl: "Taktike (mladina)",
            tr: "유소년 택틱",
            ko: "유소년 택틱",
            bh: "Taktike (mladi)"
        },
        training_training: {
            en: "Training",
            br: "Treinamento",
            es: "Entrenamiento",
            it: "Allenamento",
            nl: "Training",
            ro: "Antrenament",
            sl: "Trening",
            tr: "Eğitim",
            ko: "훈련",
            bh: "Treniranje"
        },
        training_physios: {
            en: "Physios",
            br: "Fisioterapeutas",
            es: "Fisioterapeutas",
            it: "Fisioterapisti",
            nl: "Fysiotherapeuten",
            ro: "Fizioterapeuți",
            sl: "Fizioterapevti",
            tr: "Fizyoterapistler",
            ko: "물리 치료사",
            bh: "Fizioterapeuti"
        },
        training_physio_report: {
            en: "Physio Report",
            br: "Relatório de lesões",
            es: "Informe del fisioterapeuta",
            it: "Rapporto fisioterapico",
            nl: "Fysiotherapieverslag",
            ro: "Raport fizioterapeutic",
            sl: "Fizioterapevtsko poročilo",
            tr: "물리치료사 보고서",
            ko: "물리치료사 보고서",
            bh: "Izvještaj fizioterapeuta"
        },
        search_players: {
            en: "Players",
            br: "Jogadores",
            es: "Jugadores",
            it: "Giocatori",
            nl: "Spelers",
            ro: "Jucători",
            sl: "Igralci",
            tr: "선수들",
            ko: "선수들",
            bh: "Igrači"
        },
        search_clubs: {
            en: "Clubs",
            br: "Clubes",
            es: "Clubes",
            it: "Club",
            nl: "Clubs",
            ro: "Cluburi",
            sl: "Klubi",
            tr: "Kulüpler",
            ko: "클럽",
            bh: "Klubovi"
        },
        search_national: {
            en: "National",
            br: "Seleções",
            es: "Selección Nacional",
            it: "Nazionale",
            nl: "Nationale Teams",
            ro: "Națională",
            sl: "Nacionalna",
            tr: "Milli",
            ko: "대표팀",
            bh: "Nacionalna"
        },
        search_coaches: {
            en: "Coaches",
            br: "Treinadores",
            es: "Entrenadores",
            it: "Allenatori",
            nl: "Coaches",
            ro: "Antrenori",
            sl: "Trenerji",
            tr: "Antrenörler",
            ko: "코치",
            bh: "Treneri"
        },
        search_physios: {
            en: "Physios",
            br: "Fisioterapeutas",
            es: "Fisioterapeutas",
            it: "Fisioterapisti",
            nl: "Fysiotherapeuten",
            ro: "Fizioterapeuți",
            sl: "Fizioterapevti",
            tr: "Fizyoterapistler",
            ko: "물리치료사",
            bh: "Fizioterapeuti"
        },
        search_transfers: {
            en: "Transfers",
            br: "Transferências",
            es: "Transferencias",
            it: "Trasferimenti",
            nl: "Transfers",
            ro: "Transferuri",
            sl: "Prenosi",
            tr: "Transferler",
            ko: "이적",
            bh: "Transferi"
        },
        community_forum: {
            en: "Forum",
            br: "Fórum",
            es: "Foro",
            it: "Forum",
            nl: "Forum",
            ro: "Forum",
            sl: "Forum",
            tr: "Forum",
            ko: "포럼",
            bh: "Forum"
        },
        community_rules: {
            en: "Rules",
            br: "Regras",
            es: "Reglas",
            it: "Regole",
            nl: "Regels",
            ro: "Reguli",
            sl: "Pravila",
            tr: "Kurallar",
            ko: "규칙",
            bh: "Pravila"
        },
        community_profile: {
            en: "Profile",
            br: "Perfil",
            es: "Perfil",
            it: "Profilo",
            nl: "Profiel",
            ro: "Profil",
            sl: "Profil",
            tr: "Profil",
            ko: "프로필",
            bh: "Profil"
        },
        community_links: {
            en: "Links",
            br: "Links",
            es: "Enlaces",
            it: "Link",
            nl: "Links",
            ro: "Link-uri",
            sl: "Povezave",
            tr: "Bağlantılar",
            ko: "링크",
            bh: "Linkovi"
        },
        start: {
            en: "Start",
            br: "Inicio",
            es: "Inicio",
            it: "Inizio",
            nl: "Start",
            ro: "Începe",
            sl: "Začetek",
            tr: "Başla",
            ko: "시작",
            bh: "Početak"
        },
        end: {
            en: "End",
            br: "Fim",
            es: "Fin",
            it: "Fine",
            nl: "Einde",
            ro: "Sfârșit",
            sl: "Konec",
            tr: "Son",
            ko: "끝",
            bh: "Kraj"
        },
        shoots: {
            en: "Shoots",
            br: "Chutes",
            es: "Disparos",
            it: "Tiri",
            nl: "Schoten",
            ro: "Șuturi",
            sl: "Streli",
            tr: "Şut",
            ko: "슈팅",
            bh: "Šutevi"
        },
        onTarget: {
            en: "On Target",
            br: "Chutes no gol",
            es: "Disparos al arco",
            it: "Tiri in porta",
            nl: "Schoten op het doel",
            ro: "Pe poartă",
            sl: "Streli v okvir vrat",
            tr: "Kaleyi Bulan Şut",
            ko: "유효 슈팅",
            bh: "Šutevi u okvir gola"
        },
        offTarget: {
            en: "Off Target",
            br: "Chutes para fora",
            es: "Disparos desviados",
            it: "Tiri fuori",
            nl: "Schoten naast het doel",
            ro: "Spre poartă",
            sl: "Streli mimo vrat",
            tr: "İsabetsiz Şut",
            ko: "기타 슈팅",
            bh: "Šutevi van okvira gola"
        },
        corners: {
            en: "Corners",
            br: "Escanteios",
            es: "Tiros de esquina",
            it: "Calci d'angolo",
            nl: "Hoekschoppen",
            ro: "Cornere",
            sl: "Koti",
            tr: "Korner",
            ko: "코너킥",
            bh: "Korneri"
        },
        offsides: {
            en: "Offsides",
            br: "Impedimentos",
            es: "Fuera de juego",
            it: "Fuorigioco",
            nl: "Buitenspelgevallen",
            ro: "Ofsaiduri",
            sl: "Prepovedani položaji",
            tr: "Ofsayt",
            ko: "오프사이드",
            bh: "Ofsajdi"
        },
        fouls: {
            en: "Fouls",
            br: "Faltas",
            es: "Faltas",
            it: "Falli",
            nl: "Overtredingen",
            ro: "Faulturi",
            sl: "Prekrški",
            tr: "Fauller",
            ko: "파울",
            bh: "Prekršaji"
        },
        yellowCards: {
            en: "Yellow Cards",
            br: "Cartões Amarelos",
            es: "Tarjetas Amarillas",
            it: "Cartellini Gialli",
            nl: "Gele Kaarten",
            ro: "Cartonașe Galbene",
            sl: "Rumeni kartoni",
            tr: "Sarı Kart",
            ko: "옐로우 카드",
            bh: "Žuti kartoni"
        },
        redCards: {
            en: "Red Cards",
            br: "Cartões Vermelhos",
            es: "Tarjetas Rojas",
            it: "Cartellini Rossi",
            nl: "Rode Kaarten",
            ro: "Cartonașe Roșii",
            sl: "Rdeči kartoni",
            tr: "Kırmızı Kart",
            ko: "레드 카드",
            bh: "Crveni kartoni"
        },
        hideShow: {
            en: "Hide/Show",
            br: "Ocultar/Mostrar",
            es: "Ocultar/Mostrar",
            it: "Nascondi/Mostra",
            nl: "Verbergen/Toon",
            ro: "Ascunde/Afișează",
            sl: "Skrij/Pokaži",
            tr: "Gizle/Göster",
            ko: "숨기기/보이기",
            bh: "Sakrij/Pokaži"
        },
        sendProScout: {
            en: "Send Pro Scout",
            br: "Enviar Olheiro Profissional",
            es: "Mandar Ojeador Profesional",
            it: "Manda Osservatore Professionista",
            nl: "Stuur Pro Scout",
            ro: "Trimite Scouter Profesionist",
            sl: "Pošlji Profesionalnega Oglednika",
            tr: "Profesyonel Gözlemci Gönder",
            ko: "프로 스카우트 보내기",
            bh: "Pošalji Profesionalnog Skauta"
        }
    };
}
//dropdownMenu languages by mini18
function dropdownMenu() {
    var css = '.dropdown-content{text-align: left;top:0px;border-radius: 15px;margin-top:40px;display:none;position:absolute;background-color:#f1f1f1;min-width:160px;box-shadow:0 8px 16px 0 rgba(0,0,0,.2);z-index:1}.dropdown-content a{border-radius: 15px;color:#000;padding:12px 16px;text-decoration:none;display:block}.dropdown-content a:hover{background-color:#ddd}.menu_button:hover .dropdown-content{display:block}.menu_button:hover .dropbtn{background-color:#3e8e41}';
    applyStyle(css);

    const translation = getTranslation();
    let language = getLanguage();
    if (translation.home_home[language] == undefined) {
        language = 'en';
    }

    const menu = {
        home: [
            { url: 'https://www.dugout-online.com/home/none/', text: translation.home_home[language] },
            { url: 'https://www.dugout-online.com/news/none/', text: translation.home_news[language] },
            { url: 'https://www.dugout-online.com/rules/none/', text: translation.home_rules[language] },
            { url: 'https://www.dugout-online.com/helpmain/none/', text: translation.home_help[language] },
        ],
        club: [
            { url: 'https://www.dugout-online.com/clubinfo/none/', text: translation.club_info[language] },
            { url: 'https://www.dugout-online.com/clubinfo/bids/', text: translation.club_bids[language] },
            { url: 'https://www.dugout-online.com/clubinfo/transfers/', text: translation.club_transfers[language] },
            { url: 'https://www.dugout-online.com/players/none/clubid/0/Free-online-football-manager-game', text: translation.club_players[language] },
            { url: 'https://www.dugout-online.com/players/none/view/youth/clubid/0/', text: translation.club_players_youth[language] },
            { url: 'https://www.dugout-online.com/staff/none/', text: translation.club_staff[language] },
            { url: 'https://www.dugout-online.com/settings/none/', text: translation.club_settings[language] },
        ],
        nt: [
            { url: 'https://www.dugout-online.com/players_nt/none/', text: translation.players_nt[language] },
            { url: 'https://www.dugout-online.com/tactics_nt/none/', text: translation.tactics_nt[language] },
        ],
        management: [
            { url: 'https://www.dugout-online.com/finances/none/', text: translation.management_finances[language] },
            { url: 'https://www.dugout-online.com/stadium/none/', text: translation.management_stadium[language] },
            { url: 'https://www.dugout-online.com/facilities/none/', text: translation.management_facilities[language] },
            { url: 'https://www.dugout-online.com/sponsors/none/', text: translation.management_sponsors[language] },
            { url: 'https://www.dugout-online.com/calendar/none/', text: translation.management_calendar[language] },
        ],
        tactics: [
            { url: 'https://www.dugout-online.com/tactics/none/', text: translation.tactics_fiest[language] },
            { url: 'https://www.dugout-online.com/tactics_youth/none/', text: translation.tactics_youth[language] },
        ],
        training: [
            { url: 'https://www.dugout-online.com/training/none/', text: translation.training_training[language] },
            { url: 'https://www.dugout-online.com/physios/none/', text: translation.training_physios[language] },
            { url: 'https://www.dugout-online.com/physio_report/none', text: translation.training_physio_report[language] },
        ],
        search: [
            { url: 'https://www.dugout-online.com/search_players/none/', text: translation.search_players[language] },
            { url: 'https://www.dugout-online.com/search_clubs/none/', text: translation.search_clubs[language] },
            { url: 'https://www.dugout-online.com/national_teams/none/', text: translation.search_national[language] },
            { url: 'https://www.dugout-online.com/search_coaches/none/', text: translation.search_coaches[language] },
            { url: 'https://www.dugout-online.com/search_physios/none/', text: translation.search_physios[language] },
            { url: 'https://www.dugout-online.com/search_transfers/none/', text: translation.search_transfers[language] },
        ],
        community: [
            { url: 'https://www.dugout-online.com/forum/none/', text: translation.community_forum[language] },
            { url: 'https://www.dugout-online.com/community_rules/none/', text: translation.community_rules[language] },
            { url: 'https://www.dugout-online.com/community_profile/none/', text: translation.community_profile[language] },
            { url: 'https://www.dugout-online.com/links/none/', text: translation.community_links[language] },
        ],
    };

    if ($(".menu_button").length <= 7) {
        delete menu.nt;
    } else {
        let linksJson = localStorage.getItem('DOGenieAssistant.links');
        let links = linksJson ? JSON.parse(linksJson) : {};
        const ntLinks = [];

        for (const url in links) {
            const value = links[url];
            if (value.startsWith('[NT]')) {
                const text = value.replace(/^\[NT\]\s*/, '');
                menu.nt.push({ url, text });
            }
        }

    }

    let menuIndex = 1;
    let dropdownContent = '';
    $.each(menu, function(menuKey, items) {
        const $menuButton = $('.menu_button:nth-child(' + menuIndex + ')');
        dropdownContent = '';
        $.each(items, function(index, item) {
            dropdownContent += `<a href="${item.url}">${item.text}</a>`;
        });

        $menuButton.append(`<div class="dropdown-content">${dropdownContent}</div>`);
        menuIndex++;
    });

    [...document.querySelectorAll('div#top_container > div')]
        .filter(d => d.classList.contains(`${d.id}_ico`))
        .forEach(d => {
        const anchor = document.createElement('a');
        anchor.href = d.onclick.toString().split('document.location.href=')[1].split('\'')[1];
        anchor.classList.add(...d.classList.values())
        anchor.id = d.id;
        anchor.style.cssText = d.style.cssText;
        anchor.title = d.title;
        d.parentElement.insertBefore(anchor, d);
        d.remove();
    });
    var scripts = document.getElementsByTagName('script');

    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.innerHTML && script.innerHTML.indexOf('createIconTip(') !== -1) {
            var novoScript = document.createElement('script');
            novoScript.type = 'text/javascript';
            novoScript.text = script.innerHTML;
            document.body.appendChild(novoScript);
            break;
        }
    }
}

function pageTitle() {
    let title = '';
    if (page.includes('/clubinfo/none/')) {
        title = $('.clubname').text();
    } else {
        title = location.pathname.split("/")[1].replace("_", " ");
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    $(document).prop('title', title);
    return title;
}

function coachesWage() {
    $(".search_tbl tbody tr:first").append('<td width="36" class="table_header" valign="middle" align="center" style="cursor: default;" title="Approximate Wage">Wage</td>');

    $(".search_tbl tbody tr").each(function() {
        const data = $(this).children('td').map(function() {
            return $.isNumeric($(this).text()) ? parseInt($(this).text()) : null;
        }).get().filter(Number);

        if (data.length > 0) {
            const max = Math.max(...data.slice(1, -5));
            let wage = (max <= 42) ? (24.44889 * max - 138.145) * max : (51.54712 * max - 1260) * max;
            wage = parseFloat(wage).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

            $(this).append('<td align="center"><span class="tableText">' + wage + '</span></td>');
        }
    });

    $('.search_tbl th:first').wrapInner('<div />').find('div').unwrap().wrap('<th/>');
    const header = $(".search_tbl tr:first").clone();
    $(".search_tbl tr:first").remove();
    $(".search_tbl tbody:first").before('<thead></thead>');
    $(".search_tbl thead:first").append(header);

    $(".search_tbl").dataTable({
        "searching": false,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bInfo": false,
        "bAutoWidth": false,
        "order": [[ 13, 'asc' ]]
    });
}

function readResume() {
    const toid = $(".maninfo a").attr('href').split('toid')[1].slice(1);
    const url = `https://www.dugout-online.com/readresume.php?id=${toid}`;
    $(".clubname").append(`<a href="${url}"> [Read Resume]</a>`);
}

function scoutButton() {
    const clubid = $("a[href^='https://www.dugout-online.com/clubinfo/none/clubid/']:eq(1)").attr('href').split('clubid/')[1];

    const rowIndex = $('table tbody tr').length - 18;
    $('table > tbody > tr:eq(' + rowIndex + ')').append(`
        <td valign="middle" style="padding-left: 25px; padding-right: 1px;">
            <input type="button" value="Relatório do espião" onclick="document.location.href='https://www.dugout-online.com/clubinfo/analysis/clubid/${clubid}'">
        </td>
    `);
}

function loadTactics() {
    $('#field_cont table').append('<tr><td valign="middle" style="color: unset;" colspan="2"><textarea id="dataTtc" name="dataTtc" rows="2" cols="40"></textarea></td><td valign="middle" style="color: unset;"><input type="button" value="Apply" id="apply"><input type="button" value="getTtc" id="getTtc"></td></tr>');

    $("#getTtc").click(function() {
        var data = '';
        var action = 'submit';
        data="action="+action+"&players_ids="+players[0]+"&positions="+players[1]+"&players_x="+players[2]+"&players_y="+players[3]+"&substitutes="+substitutes[0]+"&actions="+actionsb;
        data+="&options="+$("#agression_id").val()+"*"+$("#mentality_id option:selected").val()+"*"+$("#attack_wing_id option:selected").val();
        data+="*"+$("#passing_id option:selected").val()+"*"+$("#capitan_sel option:selected").val()+"*"+$("#playmaker_sel option:selected").val();
        data+="*"+$("#target_man_sel option:selected").val()+"*"+$("#penalty_sel option:selected").val();

        if($("#counter_attacks_id").prop('checked'))
            data+="*1";
        else
            data+="*0";
        if($("#offside_trap_id").prop('checked'))
            data+="*1";
        else
            data+="*0";

        if(action=="save")
        {
            if($("#save_name").val()=="Save name")
                data+="&name=slot"+$("#save_tacts option:selected").val();
            else
                data+="&name="+$("#save_name").val();
            data+="&slot="+$("#save_tacts option:selected").val()
        }

        $("#dataTtc").val(data);
    });



    $("#apply").click(function() {
        const xmlhttp = new XMLHttpRequest();
        const url = page.match('/tactics/none/') ? SERVER_URL + "/ajaxphp/tactics_save.php" :
        page.match('/tactics_youth/none/') ? SERVER_URL + "/ajaxphp/tactics_youth_save.php" :
        page.match('/tactics_nt/none/') ? SERVER_URL + "/ajaxphp/tactics_save_nt.php" : '';

        if (!url) return;

        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send($("#dataTtc").val());
        location.reload();
    });
}

function bidButton() {
    if ($('input[name="riseoffer"]').length === 1) {
        $('form[name="bidForm"]').addClass( "bidForm" );
        $( ".bidForm input:last" ).addClass( "bidButton" );

        let value = parseInt($('.bidForm input').val()) - 1000;
        let val1 = new Intl.NumberFormat('en-DE').format(value + 100000);
        let val2 = new Intl.NumberFormat('en-DE').format(value + 1000000);
        if (value < 2000000) {
            val2 = new Intl.NumberFormat('en-DE').format(parseInt(value + (value / 2)));
        }

        let language = getLanguage();
        const translation = getTranslation();
        $(`<input id="bid1" type="button" value="${translation.bid[language]} ${val1}"><input id="bid2" type="button" value="${translation.bid[language]} ${val2}"> "`).insertAfter( ".bidButton" );
        $("#bid1").click(function() {
            $('.bidForm input').val(val1);
            document.bidForm.submit();
        });
        $("#bid2").click(function() {
            $('.bidForm input').val(val2);
            document.bidForm.submit();
        });
    }
}

function bidLocalTime() {
    let riseOfferInput = $('input[name="riseoffer"]');
    if (riseOfferInput.length === 1) {
        let text = $('.info').text();
        let match = text.match(/(\d{2}-\d{2}\(\d{2}:\d{2}\))/);
        if (match) {
            let [_, dateString] = match;
            let [day, month, time] = dateString.split(/[-()]/).map(part =>part);
            let [hourCET, minute] = time.toString().match(/\d{2}/g).map(part => part);

            let dateCET = moment.tz([moment().year(), month - 1, day, hourCET, minute], "CET");
            let userTimezone = moment.tz.guess();
            let dateUserTimezone = dateCET.clone().tz(userTimezone);

            $('.info').parent().find('b:nth-child(3)').attr('title', dateUserTimezone.format("DD-MM (HH:mm)"));
        }
    }
}


function playerImage() {
    const playerId = getUrlParameter('playerID');
    let playerInfo = JSON.parse(localStorage.getItem(`DOGenieAssistant.player.${playerId}`)) || { img: "" };
    const url = `https://sortitoutsi.b-cdn.net/uploads/face/${playerInfo.img}.png`;

    const playerImg = $(".tabbed_pane img").eq(1);
    playerImg.after(`
        <input id="imgId" type="text" value="${playerInfo.img}" style="position: absolute; left: 38px; top: 150px; width: 96px;">
        <button id="refresh" type="button" style="position: absolute; left: 10px; top: 150px;">
            <i class="fa fa-refresh"></i>
        </button>
    `);
    if (playerInfo.img) {
        replacePlayerImg(url);
    }

    $("#refresh").click(function() {
        const newImgValue = $("#imgId").val();
        playerInfo.img = (newImgValue !== "" && !isNaN(newImgValue)) ? parseInt(newImgValue) : "";
        replacePlayerImg(`https://sortitoutsi.b-cdn.net/uploads/face/${playerInfo.img}.png`);
        if (playerInfo.img){
            replacePlayerImg(`https://sortitoutsi.b-cdn.net/uploads/face/${playerInfo.img}.png`);
            localStorage.setItem(`DOGenieAssistant.player.${playerId}`, JSON.stringify(playerInfo));
        } else {
            replacePlayerImg("https://www.dugout-online.com/images/club/profile/player-pic-default.png");
            localStorage.removeItem(`DOGenieAssistant.player.${playerId}`);
        }
    });
}

function replacePlayerImg(url) {
    const playerImg = $(".tabbed_pane img").eq(1);
    playerImg.attr("src", url).css({ width: "150px", height: "150px" });
}

function extractLinkFromBadge(badge) {
    const onclickValue = badge.attr('onclick');
    if (onclickValue) {
        const startIndex = 24;
        const endIndex = onclickValue.length - 1;
        return onclickValue.substring(startIndex, endIndex);
    }
    return '';
}

function createTeamBadge(link, badge, className) {
    return $(`<a class="${className}" style='cursor: pointer; float: left; position: relative; margin-left: 2px; margin-top: 5px; width: 120px; height: 120px;' href="${link}">${badge.html()}</a>`);
}

function teamLink() {
    const homeBadge = $(`.generic_badge:first`);
    const homeLink = extractLinkFromBadge(homeBadge);

    if (homeLink) {
        const homeBadgeLink = createTeamBadge(homeLink, homeBadge, 'home_badge');
        homeBadge.before(homeBadgeLink);
        homeBadge.remove();
        $(`.home_badge`).addClass('generic_badge');
    }

    const awayBadge = $(`.generic_badge:last`);
    const awayLink = extractLinkFromBadge(awayBadge);

    if (awayLink) {
        const awayBadgeLink = createTeamBadge(awayLink, awayBadge, 'away_badge');
        awayBadge.before(awayBadgeLink);
        awayBadge.remove();
        $(`.away_badge`).addClass('generic_badge');
    }
}


function getSponsors() {
    const lastSponsor = localStorage.getItem('DOGenieAssistant.lastSponsor') || '01/01/2000';
    const today = new Date(Date.now()).toLocaleString().split(',')[0];
    $('#getSponsors').css('visibility', 'visible');

    if (today === lastSponsor) {
        $('#getSponsors').css('font-style', 'italic');
        return;
    }

    sendSponsorsRequest();
}

function sendSponsorsRequest() {
    const dailySlotUrls = Array.from({ length: 3 }, (_, index) =>
                                     `https://www.dugout-online.com/sponsors/none/daily/1/slot/${index + 1}/dailyID/1001`
                                    );

    const adboardSlotUrls = Array.from({ length: 6 }, (_, index) =>
                                       `https://www.dugout-online.com/sponsors/adboards/daily/1/slot/${index + 1}/dailyID/1002`
                                      );

    const allUrls = [...dailySlotUrls, ...adboardSlotUrls];

    allUrls.forEach(url => {
        $.get(url, function (data) {
            $('.result').html(data);
        });
    });

    const today = new Date(Date.now()).toLocaleString().split(',')[0];
    localStorage.setItem('DOGenieAssistant.lastSponsor', today);
}

$("#getSponsors").click(function (e) {
    sendSponsorsRequest();
    e.preventDefault();
});

function matchSound() {
    const gameId = getUrlParameter('gameid');
    const match = JSON.parse(localStorage.getItem(`DOGenieAssistant.match.${gameId}`) || '{}');

    if (Object.keys(match).length === 0) {
        match['LAST_GOAL'] = null;
        match['LAST_OFFSIDE'] = null;
        match['GAME_ENDS'] = null;
    }

    for (let i = 0; i < 5; i++) {
        const eventType = $("#events_content td:nth-child(1)").eq(i).html();
        const eventTime = formatTime($("#events_content td:nth-child(2)").eq(i).html());

        if (soundConfig["GOAL_SOUND"] !== "" && eventType.includes('icon-goal')) {
            const isHomeTeam = ($("#events_content td:nth-child(3)").eq(i).find('a').first().text() === $('.header_clubname').text());
            const soundId = isHomeTeam ? soundConfig['HOME_GOAL_ID'] : soundConfig['AWAY_GOAL_ID'];

            handleEvent(match, 'LAST_GOAL', eventTime, soundId, gameId);
            break;
        }

        if (soundConfig["OFFSIDE_SOUND"] !== "" && eventType.includes('icon-offside')) {
            handleEvent(match, 'LAST_OFFSIDE', eventTime, soundConfig['OFFSIDE_ID'], gameId);
            break;
        }
    }

    if (soundConfig["GAME_END_SOUND"] !== "") {
        const gameEndsEvent = $("#events_content td:nth-child(3)").eq(0).html();
        const gameEndsTime = formatTime($("#events_content td:nth-child(2)").eq(0).html());

        if (gameEndsEvent.substring(0, 9) === 'Game ends') {
            if (soundConfig['GAME_END_ID'] == 0) {
                handleEvent(match, 'GAME_ENDS', gameEndsTime, gameId, gameId, gameId);
            } else {
                handleEvent(match, 'GAME_ENDS', gameEndsTime, soundConfig['GAME_END_ID'], gameId);
            }
        }
    }
}

function matchNames() {
    let playersHome = extractPlayers($("#events_content td:nth-child(3)").eq(-3).html());
    let playersAway = extractPlayers($("#events_content td:nth-child(3)").eq(-4).html());
    playersHome = setCaptain(".player_ratings:eq(0)", playersHome);
    playersAway = setCaptain(".player_ratings:eq(1)", playersAway);

    replacePlayerNames(".player_ratings:eq(0)", playersHome);
    replacePlayerNames(".key_events:eq(0)", playersHome);
    replacePlayerNames(".player_ratings:eq(1)", playersAway);
    replacePlayerNames(".key_events:eq(1)", playersAway);
    let players = playersHome.concat(playersAway);
    addButton(players)
}

function addButton(players) {
    let button = $("<button>").text("Replace events").click(function() {
        $("#events_content").each(function(i) {
            replacePlayerNames(this, players);
        });
    });
    button.css("margin-left", "20px");
    $(".window1_header_text").append(button);
}

function extractPlayers(html) {
    let players = [];
    let regex = /playerID\/(\d+)">([^<\/]+)/g;
    let matches;
    while ((matches = regex.exec(html)) !== null) {
        let playerId = matches[1];
        let nome = matches[2].trim();
        players.push({ playerId, nome });
    }
    return players;
}

function replacePlayerNames(divSelector, playerNames) {
    $(divSelector).each(function() {
        $(this).find("tbody a").each(function() {
            let playerIdMatch = $(this).attr("href").match(/playerID\/(\d+)/);
            if (playerIdMatch) {
                let playerId = playerIdMatch[1];
                let playerNameObj = playerNames.find(player => player.playerId === playerId);
                if (playerNameObj) {
                    $(this).text(playerNameObj.nome);
                }
            }
        });
    });
}

function setCaptain (divSelector, playerNames) {
    $(divSelector).each(function() {
        $(this).find("tbody a").each(function() {
            let playerIdMatch = $(this).attr("href").match(/playerID\/(\d+)/);
            if (playerIdMatch) {
                let playerId = playerIdMatch[1];
                let playerNameObj = playerNames.find(player => player.playerId === playerId);
                if (playerNameObj) {
                    let playerName = playerNameObj.nome;
                    if ($(this).text().includes("(c)")) {
                        playerName += " (c)";
                        playerNameObj['nome'] = playerName;
                    }
                }
            }
        });
    });
    return playerNames;
}

function handleEvent(match, eventName, eventTime, soundId, gameId) {
    if (formatTime(match[eventName]) < eventTime) {
        match[eventName] = eventTime;
        localStorage.setItem(`DOGenieAssistant.match.${gameId}`, JSON.stringify(match));

        $(`<iframe width="0%" height="0" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${soundId}&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>`).insertAfter("#events_content");
        $("#events_content").delay(2000);
    }
}

function formatTime(str) {
    return (str || "00:00")
        .replace(/[\[\]: ]/g, '')
        .replace(',', ':')
        .replace(/<[^>]+>/ig, '');
}

function getUrlParameter(paramName) {
    const url = window.location.href;
    const match = url.match(new RegExp(`${paramName}/(\\d+)`));

    return match ? match[1] : false;
}

function configMenu() {
    function getConfigOrDefault(configName, defaultValue) {
        return typeof configs[configName] !== 'undefined' && configs[configName] !== null ? configs[configName] : defaultValue;
    }

    const configOptions = [
        "SECONDARY_CLOCK", "DROPDDOWN_MENU", "PAGE_TITLE", "TEAM_LINK",
        "GET_SPONSORS", "SCOUT_BUTTON", "READ_RESUME", "COACHES_WAGE",
        "PLAYER_OPS_NAME", "PLAYER_OPS_ID", "PLAYER_EXP", "PLAYER_IMAGE", "SEND_PRO_SCOUT",
        "SQUAD_DETAILS", "SQUAD_FILTERS", "SQUAD_HIGH", "NATIONAL_LINK","SPREADSHEET_SQUAD",
        "BID_BUTTON", "BID_LOCAL_TIME", "LOAD_TACTICS", "TACTICS_DETAILS", "LINKS",
        "STORED_FILTERS", "GOALS_DIFFERENCE", "HIDE_TRAINING_REPORT", "COACH_EFFECTIVENESS",
        "MATCH_NAMES", "MATCH_SCORE","WRAP_TEXT", "AUTO_SCORE"
    ];

    const configForm = $(`
        <div class="gui_object" style="width: 468px; margin-left: 8px;">
            <div class="window1_wrapper" style="margin-top: 4px; width: 490px;">
                <div class="window1_header_start"></div>
                <div class="window1_header" style="width: 480px;">
                    <div class="window1_header_text">&nbsp;DO Genie Assistant Configs</div>
                    <a href="https://github.com/edunogueira/DOGenieAssistant/raw/main/DOGenieAssistant.user.js/" target="_blank" style="margin-left: 10px;">
                        <button>Update extension</button>
                    </a>
                    <a href="https://www.dugout-online.com/stadium/setticket/" target="_blank" style="margin-left: 10px;">
                        <button>Set Ticket Price</button>
                    </a>
                </div>
                <div class="window1_header_end"></div>
            </div>
            <div class="window1_wrapper" style="margin-top: 0px; width: 468px;">
                <div class="window1_content" style="width: 486px;">
                    <form name="configForm" action="#" method="post" class="configForm">
                       <table width="99%" border="0" cellspacing="1" cellpadding="1" class="matches_tbl" style="margin-bottom: 0px; margin-left: 3px; margin-top: 2px;">
                           <tbody></tbody>
                       </table>
                </div>
                <div class="window1_bottom" style="width: 488px;"></div>
            </div>
        </div>
    `).insertAfter("#footer");

    const tableBody = configForm.find(".matches_tbl tbody");

    let row = "<tr class='table_top_row'>";
    configOptions.forEach((option, index) => {
        const defaultValue = getConfigOrDefault(option, 'checked');
        const optionCheckbox = `<input type="checkbox" name="${option}" ${defaultValue}>`;
        const optionLabel = option
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

        row += `<td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                    ${optionLabel}: <br>${optionCheckbox}
                </td>`;

        if ((index + 1) % 4 === 0 && index !== configOptions.length - 1) {
            row += "</tr><tr class='table_top_row'>";
        }
    });
    row += "</tr>";

    tableBody.append(row);

    const saveButton = $('<input id="saveConfig" type="submit" style="width: 140px;margin-top: 20px;" value="Save">');
    const defaultConfigStorageButton = $('<input id="defaultConfigStorage" type="submit" style="width: 160px;margin-top: 20px; margin-left: 10px;" value="Defalut Config Storage">');
    const clearPlayerImagesButton = $('<input id="clearPlayerImages" type="submit" style="width: 140px;margin-top: 20px; margin-left: 10px;" value="Clear Player Images">');
    const getSponsorsButton = getConfigOrDefault("GET_SPONSORS", 'checked') ? $('<input id="getSponsors" type="submit" style="width: 140px;margin-top: 20px;" value="Get Sponsors">') : undefined;

    configForm.find(".window1_content").append(saveButton, defaultConfigStorageButton, clearPlayerImagesButton, getSponsorsButton);

    saveButton.click(function() {
        configOptions.forEach(option => {
            const isChecked = $(`input[name="${option}"]`).is(":checked");
            configs[option] = isChecked ? "checked" : "";
        });

        localStorage.setItem('DOGenieAssistant.configs', JSON.stringify(configs));
    });
}

function defaultConfigStorage() {
    $("#defaultConfigStorage").click(function(e) {
        localStorage.removeItem("DOGenieAssistant.configs")
        e.preventDefault();
    });
}

function getStorage(storageConfigs) {
    const defaultConfigs = {
        "SECONDARY_CLOCK": 'checked',
        "DROPDDOWN_MENU": 'checked',
        "PAGE_TITLE": 'checked',
        "READ_RESUME": 'checked',
        "PLAYER_OPS_NAME": 'checked',
        "PLAYER_OPS_ID": 'checked',
        "PLAYER_EXP": 'checked',
        "SQUAD_DETAILS": 'checked',
        "SQUAD_FILTERS": 'checked',
        "NATIONAL_LINK": 'checked',
        "SQUAD_HIGH": 'checked',
        "LOAD_TACTICS": 'checked',
        "TACTICS_DETAILS": 'checked',
        "COACHES_WAGE": 'checked',
        "SCOUT_BUTTON": 'checked',
        "SPREADSHEET_SQUAD": 'checked',
        "BID_BUTTON": 'checked',
        "BID_LOCAL_TIME": 'checked',
        "TEAM_LINK": 'checked',
        "GET_SPONSORS": 'checked',
        "PLAYER_IMAGE": 'checked',
        "SEND_PRO_SCOUT": 'checked',
        "LINKS": 'checked',
        "STORED_FILTERS": 'checked',
        "GOALS_DIFFERENCE": 'checked',
        "HIDE_TRAINING_REPORT": 'checked',
        "COACH_EFFECTIVENESS": 'checked',
        "MATCH_NAMES": 'checked',
        "MATCH_SCORE": 'checked',
        "WRAP_TEXT": 'checked',
        "AUTO_SCORE": 'checked',
    };

    return (storageConfigs == null || storageConfigs == '[]') ? defaultConfigs : JSON.parse(storageConfigs);
}

function configSound() {
    const soundConfigOptions = [
        { name: "MATCH_SOUND", defaultValue: 'checked' },
        { name: "GOAL_SOUND", defaultValue: 'checked' },
        { name: "HOME_GOAL_ID", defaultValue: '1579437467' },
        { name: "AWAY_GOAL_ID", defaultValue: '1636248327' },
        { name: "UPDATE_GOAL_ID", defaultValue: '1888294176' },
        { name: "OFFSIDE_SOUND", defaultValue: 'checked' },
        { name: "OFFSIDE_ID", defaultValue: '1636263519' },
        { name: "GAME_END_SOUND", defaultValue: 'checked' },
        { name: "GAME_END_ID", defaultValue: '1636248255' },
    ];

    const soundConfig = getSoundStorage(localStorage.getItem('DOGenieAssistant.soundConfig'));

    const soundForm = $(`
        <div class="gui_object" style="width: 468px; margin-left: 8px;">
            <div class="window1_wrapper" style="margin-top: 4px; width: 468px;">
                <div class="window1_header_start"></div>
                <div class="window1_header" style="width: 460px;">
                    <div class="window1_header_text">&nbsp;DO Genie Assistant Sound Configs</div>
                </div>
                <div class="window1_header_end"></div>
            </div>
            <div class="window1_wrapper" style="margin-top: 0px; width: 468px;">
                <div class="window1_content" style="width: 466px;">
                    <form name="configForm" action="#" method="post" class="configForm">
                       <table width="99%" border="0" cellspacing="1" cellpadding="1" class="matches_tbl" style="margin-bottom: 0px; margin-left: 3px; margin-top: 2px;">
                           <tbody></tbody>
                       </table>
                </div>
                <div class="window1_bottom_start"></div>
                <div class="window1_bottom" style="width: 464px;"></div>
            </div>
        </div>
    `).insertAfter("#footer");

    const tableBody = soundForm.find(".matches_tbl tbody");

    soundConfigOptions.forEach(option => {
        const optionValue = soundConfig[option.name] === null ? option.defaultValue : soundConfig[option.name];
        const inputType = option.name.includes("_ID") ? 'text' : 'checkbox';

        const row = `<tr class="table_top_row">
                        <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                            ${option.name.replace('_', ' ')}: <input type="${inputType}" name="${option.name}" value="${optionValue}" ${optionValue}>
                        </td>
                    </tr>`;

        tableBody.append(row);
    });

    const saveButton = $('<input id="saveSoundConfig" type="submit" style="width: 140px;margin-top: 20px;" value="Save">');
    const clearMatchStorageButton = $('<input id="clearMatchStorage" type="submit" style="width: 140px;margin-top: 20px;; margin-left: 10px" value="Clear Match Storage">');
    const defaultSoundStorageButton = $('<input id="defaultSoundStorage" type="submit" style="width: 160px;margin-top: 20px; margin-left: 10px;" value="Default Sound Storage">');

    soundForm.find(".window1_content").append(saveButton, clearMatchStorageButton, defaultSoundStorageButton);

    saveButton.click(function() {
        soundConfigOptions.forEach(option => {
            const inputElement = $(`input[name="${option.name}"]`);
            soundConfig[option.name] = inputElement.is(":checkbox") ? inputElement.is(":checked") ? "checked" : "" : inputElement.val();
        });

        localStorage.setItem('DOGenieAssistant.soundConfig', JSON.stringify(soundConfig));
    });
}

function clearMatchStorage() {
    $("#clearMatchStorage").click(function(e) {
        const matchKeys = Object.keys(localStorage).filter(key => key.startsWith('DOGenieAssistant.match'));
        for (const key of matchKeys) {
            localStorage.removeItem(key);
        }

        e.preventDefault();
    });
}

function defaultSoundStorage() {
    $("#defaultSoundStorage").click(function(e) {
        localStorage.removeItem("DOGenieAssistant.soundConfig")
        e.preventDefault();
    });
}

function getSoundStorage(storageConfigs) {
    const defaultSoundConfig = {
        'MATCH_SOUND': 'checked',
        'GOAL_SOUND': 'checked',
        'HOME_GOAL_ID': '1579437467',
        'AWAY_GOAL_ID': '1636248327',
        'UPDATE_GOAL_ID': '1888294176',
        'OFFSIDE_SOUND': 'checked',
        'OFFSIDE_ID': '1636263519',
        'GAME_END_SOUND': 'checked',
        'GAME_END_ID': '1636248255'
    };

    return storageConfigs ? JSON.parse(storageConfigs) : defaultSoundConfig;
}

function clearPlayerImages() {
    $("#clearPlayerImages").click(function(e) {
        let arr = [];
        let i =0
        for (i = 0; i < localStorage.length; i++){
            if (localStorage.key(i).substring(0,23) == 'DOGenieAssistant.player') {
                arr.push(localStorage.key(i));
            }
        }
        for (i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }
        e.preventDefault();
    });
}

function links() {
    let linksJson = localStorage.getItem('DOGenieAssistant.links');
    let links = linksJson ? JSON.parse(linksJson) : {};

    if (links[window.location.href]) {
        $('.user_bar').append('<button id="btnSaveLink" style="background: none;border: none;margin-left: -58px;margin-top: 11px;font-size: 23px;cursor:pointer;color: white;"><i class="fa fa-star"></i></button>');
    } else {
        $('.user_bar').append('<button id="btnSaveLink" style="background: none;border: none;margin-left: -58px;margin-top: 11px;font-size: 23px;cursor:pointer;color: white;"><i class="fa fa-star-o"></i></button>');
    }

    if (page.includes('/links/none/')) {
        var table = $('<table  cellspacing="1" cellpadding="2" style="width: 940px;">').attr('id', 'urlsTable').addClass('display').addClass('forumline');
        var thead = $('<thead>').append('<tr class="table_top_row" style="text-align: center;text-transform: uppercase;"><th>Url</th><th>Title</th><th>Action</th></tr>');
        var tbody = $('<tbody></div>');

        var tr = '';
        Object.keys(links).forEach(function(url, index) {
            var trClass = index % 2 === 0 ? 'matches_row1' : 'matches_row2';
            tr = $('<tr>').addClass(trClass).append(
                $('<td align="center">').addClass('urlCell').append('<a href="' + url + '" target="_blank" class="def_icon" style="margin: 2px;">' + url.replace('https://www.dugout-online.com/','').substring(0,60) + '</a>'),
                $('<td align="center">').addClass('keyCell').append('<span align="center"class="def_icon" style="margin: 2px;">' + links[url] + '</span>'),
                $('<td align="center">').append('<button class="btnEdit">Edit</button><button class="btnRemove">Remove</button>')
            );
            tbody.append(tr);
        });

        table.append(thead, tbody);
        var staticDiv = $('<div>').addClass('group').text('Links');
        $('#pane1').append(staticDiv);
        $('#pane1').append(table);

        var urlsDataTable = $('#urlsTable').DataTable({
            "searching": true,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bInfo": false,
            "bAutoWidth": false,
            "order": [
                [0, "asc"]
            ]
        });

        $('#urlsTable_filter').css({
            'position': 'absolute',
            'left': '270px',
            'top': '0px'
        });
        $('#urlsTable tbody').on('click', '.btnEdit', function() {
            var cell = urlsDataTable.cell($(this).parents('tr').find('.keyCell'));
            var originalValue = $(cell.data()).text();
            var newValue = prompt('Edit Key:', originalValue);

            if (newValue !== null && newValue !== originalValue) {
                cell.data(newValue);
                var urlCell = urlsDataTable.cell($(this).parents('tr').find('.urlCell'));
                var url = urlCell.data().match(/href="([^"]*)/)[1];
                links[url] = newValue;
                localStorage.setItem('DOGenieAssistant.links', JSON.stringify(links));
            }
        });

        $('#urlsTable tbody').on('click', '.btnRemove', function() {
            var row = urlsDataTable.row($(this).parents('tr'));
            var data = row.data();
            var urlToRemove = $(data[0]).attr('href');

            delete links[urlToRemove];

            row.remove().draw();

            localStorage.setItem('DOGenieAssistant.links', JSON.stringify(links));

        });
    }

    $('#btnSaveLink').on('click', function() {
        let linksJson = localStorage.getItem('DOGenieAssistant.links');
        let links = linksJson ? JSON.parse(linksJson) : {};

        if (links[window.location.href]) {
            delete links[window.location.href];
        } else {
            links[window.location.href] = document.title;
        }
        localStorage.setItem('DOGenieAssistant.links', JSON.stringify(links));
        location.reload();
    });
}

//storedFilters by mini18
function storedFilters() {
    const storedFilters = JSON.parse(localStorage.getItem("DOGenieAssistant.storedFilters")) || {
        search_players: {
            default: ["", "", true, false, "13", "35", false, "", "", "", "0", "0", "", "DESC", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", ],
        },
        search_clubs: {
            default: ["", "", "1", "1000", false, "", "", "", "DESC"],
        },
        national_teams: {
            default: [true, false, false, false, "", "1", "1000", "", "", "", "DESC"],
        },
        search_coaches: {
            default: ["", "", "", "", "DESC", "36", "80", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", false, ],
        },
        search_physios: {
            default: ["", "", "", "36", "80", "1", "50", "", "DESC", false],
        },
        search_transfers: {
            default: ["", "", "13", "35", false, "", "", "", "0", "0", "", "DESC", "", "", false, "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", "1", "50", ],
        },
    };

    const currentPage = page.match("search_players|search_transfers|search_clubs|search_coaches|national_teams|search_physios")[0];
    const currentFilters = storedFilters[currentPage];

    const filterElems = document.querySelectorAll("#filter_div input:not([type=hidden]):not([type=button]), #filter_div select");

    function saveCurrentFilter() {
        const newFilterName = prompt("Please enter filter name", "filter " + Object.keys(currentFilters).length) || "";
        if (newFilterName === "" || currentFilters[newFilterName] !== undefined || newFilterName === "default") {
            alert("The name you entered is already in use or not valid!");
            return;
        }

        const newFilter = Array.from(filterElems).map(element => {
            if (element.type === "select-one" || element.type === "text") {
                return element.value;
            }
            return element.checked;
        });

        currentFilters[newFilterName] = newFilter;
        localStorage.setItem("DOGenieAssistant.storedFilters", JSON.stringify(storedFilters));
        loadOption(newFilterName);
        selectFilter.value = newFilterName;
    }

    function loadFilter(filterName) {
        Array.from(filterElems).forEach((element, index) => {
            if (element.type === "select-one" || element.type === "text") {
                if (element.value !== currentFilters[filterName][index]) {
                    element.value = currentFilters[filterName][index];
                    flashElement(element);
                }
            } else {
                if (element.checked !== currentFilters[filterName][index]) {
                    element.checked = currentFilters[filterName][index];
                    flashElement(element);
                }
            }
        });
    }

    function removeFilter(filterName) {
        if (filterName === "default" || !confirm(`Are you sure you want to remove "${filterName}"?`)) return;
        delete currentFilters[filterName];
        localStorage.setItem("DOGenieAssistant.storedFilters", JSON.stringify(storedFilters));
        selectFilter.remove(selectFilter.selectedIndex);
        loadFilter("default");
    }

    function loadOption(filterName) {
        const optionFilter = new Option(filterName, filterName);
        selectFilter.add(optionFilter);
    }

    function flashElement(element) {
        element.classList.add("flash-elem");
        setTimeout(() => {
            element.classList.remove("flash-elem");
        }, 1000);
    }

    const flashElementStyle = document.createElement("style");
    flashElementStyle.innerHTML = `
        .flash-elem {
            animation: flash 1.5s;
        }
        @keyframes flash {
            0% { box-shadow: 0 0 0 2px red; }
            100% { box-shadow: 0 0 0 2px transparent; }
        }
    `;
    document.body.append(flashElementStyle);

    const windowHeader = document.querySelector(".window1_header");
    const selectFilter = document.createElement("select");
    selectFilter.style.width = "auto";
    selectFilter.style.verticalAlign = "middle";
    const defaultOption = new Option("Default", "default");
    const div = document.createElement("div");
    div.textContent = "Filters :";
    div.style.textAlign = "right";

    const delBtn = document.createElement("a");
    const saveBtn = document.createElement("a");

    const xmark = document.createElement("img");
    const checkmark = document.createElement("img");

    xmark.src = "https://www.dugout-online.com/images/basic_elements/gui/delete.png";
    checkmark.src = "https://www.dugout-online.com/images/basic_elements/gui/check.png";

    checkmark.style = xmark.style = "vertical-align: middle;";

    saveBtn.href = delBtn.href = "javascript:void(0)";

    xmark.title = "Delete selected filter";
    checkmark.title = "Save the current filter";

    const btnSep = document.createElement("b");
    btnSep.textContent = " | ";

    loadOption("default");

    for (const filterName in currentFilters) {
        if (filterName === "default") continue;
        loadOption(filterName);
    }

    delBtn.append(xmark);
    saveBtn.append(checkmark);
    div.append(selectFilter, delBtn, btnSep, saveBtn);
    windowHeader.append(div);

    selectFilter.addEventListener("change", () => loadFilter(selectFilter.value));
    delBtn.addEventListener("click", () => removeFilter(selectFilter.value));
    saveBtn.addEventListener("click", saveCurrentFilter);
}

function goalsDifference() {
    if ($('#myTable').length === 0) {
        return;
    }
    let isColspan = $('#myTable thead th[colspan]').length > 0;
    let ref = isColspan ? 9 : 8;

    if (isColspan) {
        $('#myTable th[colspan]').removeAttr('colspan');
        $('#myTable thead th:eq(1)').after($('<th>').text(''));
    }

    let $tbody = $('#myTable tbody');
    $tbody.find('tr td:nth-child(' + ref + ')').each(function() {
        $(this).after($(this).clone());
    });

    $('<th>', {
        class: 'header',
        align: 'center',
        width: '70',
        style: 'border-left: solid 1px #999999;',
        text: 'PTS'
    }).appendTo('#myTable thead tr');

    let table = $('#myTable').DataTable({
        searching: false,
        paging: false,
        lengthChange: false,
        info: false,
        autoWidth: false
    });

    table.column(ref).data().each(function(value, index) {
        let gpColValue = table.cell(index, ref - 2).data();
        let gcColValue = table.cell(index, ref - 1).data();
        let difference = parseFloat(gpColValue) - parseFloat(gcColValue);
        table.cell(index, ref).data(parseFloat(difference.toFixed(2)));
    });
    $('#myTable thead tr th:nth-child(' + (ref + 1) + ')').text('GD');
}

function hideTrainingReport() {
    $('<input type="checkbox" id="toggleRows" checked>').insertAfter('.window1_header_text');
    $('<label for="toggleRows">Hide player in training report</label>').insertAfter('#toggleRows');

    $('#toggleRows').change(function() {
        if ($(this).is(':checked')) {
            $('tbody tr').each(function() {
                if ($(this).find('input[type="hidden"]').val() === '1') {
                    $(this).hide();
                }
            });
        } else {
            $('tbody tr').show();
        }
    });

    $('tbody tr').each(function() {
        if ($(this).find('input[type="hidden"]').val() === '1') {
            $(this).hide();
        }
    });
}

function coachEffectiveness() {
    const parsePlayer = (doc = document) => {
        const [headerEl, , bioEl, basicEl, mainEl] = doc
        .querySelector("#main-1")
        .parentNode.querySelectorAll(":scope > div");

        const [skillsEl, personalityEl, positionsEl, formEl, econEl] =
              mainEl.querySelectorAll(":scope > div");

        const [, contractEl, , wageEl, , estValueEl] = econEl
        .querySelector("table")
        .querySelectorAll(":scope>tbody>tr[class*=row]>td");

        const hasContract = contractEl.textContent.trim() !== "/";
        const contract = hasContract
        ? Number(contractEl.textContent.trim()) || 1
        : null;

        return { contract };
    }; // Placeholder function compatible with DO parser module

    // Initialize UI Elements
    const initCoachEffectivenessUI = () => {
        const trainingEl = document.querySelector("div.training_quality_wrapper");
        const coachUIEl = document.createElement("div");

        coachUIEl.classList.add("training_quality_wrapper");
        coachUIEl.style =
            "line-height: 25px; font-weight: bold; margin-top: 1px; gap: 10px; display: flex; justify-content: center; height: 18px;";

        const coachTextEl = createTextEl("Coaching effectiveness:");
        const playersTextEl = createTextEl("Number of contracted players:");
        const playersCountEl = createTextEl("-");
        const effectivenessEl = createTextEl("-");
        const recalcBtnEl = createRecalcButton();

        // Append elements to the coachUIEl container
        coachUIEl.append(
            playersTextEl,
            playersCountEl,
            coachTextEl,
            effectivenessEl,
            recalcBtnEl
        );

        // Insert the new container after the existing training quality element
        trainingEl.after(coachUIEl);

        // Event listener for recalculation
        recalcBtnEl.addEventListener("click", () =>
                                     recalculateEffectiveness(playersCountEl, effectivenessEl)
                                    );
    };

    // Helper function to create text elements
    const createTextEl = (textContent) => {
        const textEl = document.createElement("p");
        textEl.textContent = textContent;
        return textEl;
    };

    // Helper function to create the recalculate button
    const createRecalcButton = () => {
        const recalcBtnEl = document.createElement("img");
        recalcBtnEl.src = "https://i.imgur.com/ypTANOM.png";
        recalcBtnEl.style = "cursor: pointer;";
        recalcBtnEl.title = "Recalculate coaching effectiveness";
        return recalcBtnEl;
    };

    // Function to recalculate coaching effectiveness
    const recalculateEffectiveness = (playersCountEl, effectivenessEl) => {
        const urls = Array.from(
            document.querySelectorAll(
                "div#firstteam a[href*=players],div#youthteam a[href*=players]"
            )
        ).map((player) => player.href);

        const fetches = [];
        const playerContracts = [];
        urls.forEach((url) => {
            const playerFetch = fetch(url).then((response) =>
                                                response.text().then((text) => {
                const doc = new DOMParser().parseFromString(text, "text/html");
                const player = parsePlayer(doc);
                playerContracts.push(player.contract);
            })
                                               );
            fetches.push(playerFetch);
        });

        const percentages = {
            0: 100,
            1: 99,
            2: 98,
            3: 96,
            4: 92,
            5: 88,
            6: 82,
            7: 76,
            8: 68,
            9: 60,
            10: 50,
            11: 40,
            12: 28,
            13: 16,
        };

        // Fetch the number of coaches (or staff) asynchronously
        const numberOfPlayersPromise = fetch("https://www.dugout-online.com/staff/")
        .then((response) => response.text())
        .then((text) => {
            const doc = new DOMParser().parseFromString(text, "text/html");
            const numberOfCoaches = doc
            .querySelector("table.forumline")
            .querySelectorAll("tr[class*=matches_row]").length;
            return numberOfCoaches;
        });

        // Wait for all fetches to complete, including the numberOfPlayersPromise
        Promise.all([...fetches, numberOfPlayersPromise]).then((results) => {
            const numberOfPlayers = results[results.length - 1]; // The last item in results is numberOfPlayers
            const numPlayers = playerContracts.filter((e) => e).length;
            const extraPlayers =
                  numPlayers <= numberOfPlayers * 7
            ? 0
            : numPlayers - numberOfPlayers * 7;

            const effectiveness =
                  extraPlayers <= 0
            ? 100
            : extraPlayers > 13
            ? 10
            : percentages[extraPlayers];

            const color =
                  effectiveness === 100
            ? "#007700"
            : effectiveness > 16
            ? "#ba7f00"
            : "#ff0000";

            // Update UI with calculated values
            updateUI(
                playersCountEl,
                effectivenessEl,
                numPlayers,
                effectiveness,
                color
            );
        });
    };

    // Helper function to update UI
    const updateUI = (
        playersCountEl,
        effectivenessEl,
        numPlayers,
        effectiveness,
        color
    ) => {
        playersCountEl.style.color = color;
        effectivenessEl.style.color = color;
        playersCountEl.textContent = `${numPlayers}`;
        effectivenessEl.textContent = `${effectiveness}%`;
    };

    // Initialize the UI
    initCoachEffectivenessUI();
}

function importExport() {
    const importButton = $('<input id="importButton" type="submit" style="width: 140px;margin-top: 20px;" value="Import">');
    const exportButton = $('<input id="exportButton" type="submit" style="width: 140px;margin-top: 20px;" value="Export">');

    var buttonsRow = $('<tr></tr>').append(
        $('<td width="400" height="30" align="right" valign="middle"></td>').append($('<span>DO Genie Assistant Configs </span>')).append(importButton),
        $('<td></td>').append(exportButton)
    );

    var textAreaRow = $('<tr></tr>').append(
        $('<td colspan="2" align="left" valign="middle" style="padding-top: 7px;padding-left: 200px;"></td>').append($('<textarea id="dataTextArea" rows="10" cols="50"></textarea>'))
    );

    $(".tabbed_pane").find("table").find("tr").last().after(buttonsRow, textAreaRow);

    exportButton.click(function(event) {
        event.preventDefault();
        let exportedData = {};
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.startsWith("DOGenieAssistant.")) {
                exportedData[key] = localStorage.getItem(key);
            }
        }
        let jsonString = JSON.stringify(exportedData);
        let textarea = $("#dataTextArea");
        textarea.val(jsonString);
    });

    importButton.click(function() {
        let jsonString = $("#dataTextArea").val();
        let importedData = JSON.parse(jsonString);
        for (let key in importedData) {
            if (importedData.hasOwnProperty(key)) {
                localStorage.setItem(key, importedData[key]);
            }
        }
    });
}

//wrapText by mini18
function wrapText() {
    const wrapTextWithTag = (tag) => {
        const textarea = messageEditor.editAreaText;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = textarea.value.substring(startPos, endPos);
        const newText = `[${tag}]${selectedText}[/${tag}]`;

        textarea.value = textarea.value.substring(0, startPos) + newText + textarea.value.substring(endPos);

        const newCursorPosition = startPos + newText.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
    }

    document.querySelector("div.font_bold").removeAttribute("onclick");
    document.querySelector("div.font_italic").removeAttribute("onclick");
    document.querySelector("div.font_underline").removeAttribute("onclick");

    document.querySelector("div.font_bold").addEventListener("click", function() {
        wrapTextWithTag("b");
    });
    document.querySelector("div.font_italic").addEventListener("click", function() {
        wrapTextWithTag("i");
    });
    document.querySelector("div.font_underline").addEventListener("click", function() {
        wrapTextWithTag("u");
    });
}

//autoScore by lumfurt
function autoScore() {
    const button = $("<button>").text("Update scores").click(function() {
        updateScores();
        button.prop('disabled', true).removeClass('enabled').addClass('disabled');
    });

    const styles = `
            .enabled {
                background-color: #4CAF50;color: white;border: none;cursor: pointer;margin-left: 20px;padding: 5px 10px;
            }
            .disabled {
                background-color: grey;color: white;border: none;cursor: not-allowed;margin-left: 20px;padding: 5px 10px;
            }
        `;
    $("<style>").text(styles).appendTo("head");

    button.addClass('enabled');
    $(".doformslong").before(button);
}

async function fetchScore(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const html = parser.parseFromString(data, "text/html");

        const goalsHome = html.getElementById("goals_home")?.textContent;
        const goalsAway = html.getElementById("goals_away")?.textContent;

        if (goalsHome && goalsAway) {
            return `[${goalsHome.trim()} : ${goalsAway.trim()}]`;
        } else {
            console.error(`Could not retrieve scores for game with URL ${url}`);
            return "";
        }
    } catch (error) {
        console.error(`Error fetching score for URL ${url}:`, error);
        return "";
    }
}

async function updateScores() {
    const gameLinks = Array.from(document.querySelectorAll("td a[href*='gameid']"))
    .filter(link => !/\d/.test(link.innerText) || link.innerText.includes('['));
    const scorePromises = gameLinks.map(link => fetchScore(link.href));
    const gameScores = await Promise.all(scorePromises);

    if (scores == "") {
        scores = gameScores;
    } else {
        for (let i = 0; i < scores.length; i++) {
            if (scores[i] !== gameScores[i]) {
                const soundId = soundConfig['UPDATE_GOAL_ID'];
                scores[i] = gameScores[i];
                $(`<iframe width="0%" height="0" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${soundId}&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>`).insertBefore("#myTable");
            }
        }
    }
    gameLinks.forEach((link, index) => {
        const score = gameScores[index];
        if (score) {
            link.innerText = score;
        }
    });
    let minTime = 1 * 60 * 1000;
    let maxTime = 2 * 60 * 1000;
    let randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    setTimeout(updateScores, randomTime);
}

//match score by Gleybe
function matchScore() {
    const shotKeywords = ['curls it towards the top corner', 'drives it', 'goal!', 'tries the long shot','shoots', 'from the distance', 'aims', 'sends it flying', 'tries his luck', 'climbs above', 'shot goes through the wall', 'goes for glory', 'from outside the area', 'powerful shot', 'he outjumps', 'wins the aerial challenge', 'curls it over the wall', 'with a shot', 'great shot', 'through the wall', 'gets to the ball before', 'with the header', 'he jumps higher', 'with a nice header', 'jumps higher than', 'beats', 'powerful header', 'uses the inside of his foot to curl a shot', 'goes for it', 'taps it towards the goal', 'over the wall', 'wins the challenge', 'curling shot', 'climbs above', 'gets to the ball in front', 'rises above', 'he rises above', 'saved by the goalkeeper', 'attempts a lob', 'hits the wall and bounces wide', 'jumps and climbs above', 'neat header', 'off the bar', 'nods it wide','curls it towards the top left corner','... header','heads the ball with confidence'];
    const onTargetKeywords = ['goal!', 'saves it', 'by the keeper', 'safe hands', 'no problem', 'fantastic save', 'tips it wide', 'had it covered', 'spectacular effort', 'what a save', 'tips it away', 'off the bar', 'saved by', 'quick reaction', 'goalkeeper saves', 'the post', 'saves!', 'saves and holds the ball', 'keeper dives on the ball', 'keeper beaten', 'with the save', 'great save', 'it\'s in','off the bar','beautiful save','keeper with a save','keeper equals to it'];
    const offTargetKeywords = ['over the bar', 'blocks the shot', 'inches wide', 'off target', 'just wide', 'bounces', 'goes wide', 'good block', 'but hits', 'high and wide','but the ball hits', 'nods it wide'];
    const illegalKeywords = ['offside', 'rises his flag', 'penalty', 'diver', 'behind the goal', 'own goal', 'breaks up the play'];
    const offsideKeywords = ['offside', 'rises his flag'];
    const legalKeywords = ['evades the offside trap', 'flag stays down', 'offside trap beaten', 'badly executed offside trap'];
    const foulKeywords = ['foul', 'Referee stops the play'];
    const yellowKeywords = ['yellow'];
    const redKeywords = ['red card','his second yellow',"it's his second","it's red"]
    const cornersKeywords = ['corner awarded','will take this corner','will take the corner','... corner!']

    const homeTeam = document.querySelectorAll('.game_general')[1].innerText.trim().toLowerCase();
    const goalsHomeTeam = document.querySelectorAll('.game_general')[2].innerText.trim().toLowerCase();
    const goalsAwayTeam = document.querySelectorAll('.game_general')[3].innerText.trim().toLowerCase();
    const awayTeam = document.querySelectorAll('.game_general')[4].innerText.trim().toLowerCase();
    const events = document.querySelectorAll('#events_content table tbody tr');

    let language = getLanguage();
    const translation = getTranslation();
    // Function to count shots based on minute range
    function countShots(startMin, endMin) {
        let homeTeamShots = { onTarget: 0, offTarget: 0, offsides: 0, corners: 0, foul:0, yellow: 0, red: 0 };
        let awayTeamShots = { onTarget: 0, offTarget: 0, offsides: 0, corners: 0, foul:0, yellow: 0, red: 0 };

        for (const event of events) {
            const eventText = event.innerText.toLowerCase().trim();
            const gameTime = parseFloat(event.querySelector('td:nth-child(2) b').innerText.replace(/[^\d:]/g, '').split(':')[0]);

            if (gameTime >= startMin && gameTime <= endMin) {
                let isShot = shotKeywords.some(keyword => eventText.includes(keyword));
                let isSaved = onTargetKeywords.some(keyword => eventText.includes(keyword));
                let isOffTarget = offTargetKeywords.some(keyword => eventText.includes(keyword));
                let isIllegal = illegalKeywords.some(keyword => eventText.includes(keyword));
                let isOffside = offsideKeywords.some(keyword => eventText.includes(keyword));
                let isLegal = legalKeywords.some(keyword => eventText.includes(keyword));
                let isFoul = foulKeywords.some(keyword => eventText.includes(keyword));
                let isYellow = yellowKeywords.some(keyword => eventText.includes(keyword));
                let isRed = redKeywords.some(keyword => eventText.includes(keyword));
                let isCorner = cornersKeywords.some(keyword => eventText.includes(keyword));
                if ((eventText.includes('blocks the shot')) && (eventText.includes('free kick'))) {
                    isOffTarget = false;
                    isSaved = true;
                }
                if ((eventText.includes('foul'))) {
                    if ((eventText.includes('no foul')) || (eventText.includes('play on'))) {
                        isFoul = false;
                    }
                }

                const isHomeTeam = eventText.includes(homeTeam);
                const isAwayTeam = eventText.includes(awayTeam);
                let teamShots = isHomeTeam ? homeTeamShots : isAwayTeam ? awayTeamShots : null;

                if (isLegal) {
                    isOffside = false;
                }

                if (teamShots) {
                    // Contagem de eventos relacionados a finalizações
                    if (isShot) {
                        if (isOffTarget) {
                            teamShots.offTarget++;
                        } else if (isSaved) {
                            teamShots.onTarget++;
                        }

                        if (isIllegal) {
                            if (isOffTarget) {
                                teamShots.offTarget--;
                            } else if (isSaved) {
                                teamShots.onTarget--;
                            }
                        }
                    }

                    // Contagem de impedimentos
                    if (isOffside) {
                        teamShots.offsides++;
                    }

                    // Contagem de faltas
                    if (isFoul) {
                        teamShots.foul++;
                    }

                    // Contagem de cartões amarelos
                    if (isYellow) {
                        teamShots.yellow++;
                    }

                    // Contagem de cartões vermelhos
                    if (isRed) {
                        teamShots.red++;
                    }

                    // Contagem de escanteios
                    if (isCorner) {
                        teamShots.corners++;
                    }
                }
            }
        }

        // Calcular total de finalizações
        homeTeamShots.total = homeTeamShots.onTarget + homeTeamShots.offTarget;
        awayTeamShots.total = awayTeamShots.onTarget + awayTeamShots.offTarget;
        // Update the table with stats
        document.querySelector('#shotsTable').innerHTML = `
            <table class="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th class="player_ratings_header">${homeTeam.toUpperCase()}</th>
                        <th class="player_ratings_header">${goalsHomeTeam.toUpperCase()} vs ${goalsAwayTeam.toUpperCase()}</th>
                        <th class="player_ratings_header">${awayTeam.toUpperCase()}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table_row_static1">
                        <td>${homeTeamShots.total}</td>
                        <th>${translation.shoots[language]}</th>
                        <td>${awayTeamShots.total}</td>
                    </tr>
                    <tr class="table_row_static2">
                        <td>${homeTeamShots.onTarget}</td>
                        <th>${translation.onTarget[language]}</th>
                        <td>${awayTeamShots.onTarget}</td>
                    </tr>
                    <tr class="table_row_static1">
                        <td>${homeTeamShots.offTarget}</td>
                        <th>${translation.offTarget[language]}</th>
                        <td>${awayTeamShots.offTarget}</td>
                    </tr>
                    <tr class="table_row_static2">
                        <td>${homeTeamShots.corners}</td>
                        <th>${translation.corners[language]}</th>
                        <td>${awayTeamShots.corners}</td>
                    </tr>
                    <tr class="table_row_static1">
                        <td>${homeTeamShots.offsides}</td>
                        <th>${translation.offsides[language]}</th>
                        <td>${awayTeamShots.offsides}</td>
                    </tr>
                    <tr class="table_row_static2">
                        <td>${homeTeamShots.foul}</td>
                        <th>${translation.fouls[language]}*</th>
                        <td>${awayTeamShots.foul}</td>
                    </tr>
                    <tr class="table_row_static1">
                        <td>${homeTeamShots.yellow}</td>
                        <th>${translation.yellowCards[language]}</th>
                        <td>${awayTeamShots.yellow}</td>
                    </tr>
                    <tr class="table_row_static2">
                        <td>${homeTeamShots.red}</td>
                        <th>${translation.redCards[language]}</th>
                        <td>${awayTeamShots.red}</td>
                    </tr>
                </tbody>
            </table>`;
    }

    // Create the control UI
    const slider = document.createElement('div');
    slider.innerHTML = `
    <div id="tblScore" style="position: fixed; bottom: 0; left: 0px; z-index: 9999; width: 400px; text-align: center; background-color:#fff; padding: 10px;">
        <label for="startMin">${translation.start[language]} (min):<span id="startMinValue">0</span></label>
        <input type="range" id="startMin" min="0" max="120" value="0" style="width: 100%;">
        <br>
        <label for="endMin">${translation.end[language]} (min): <span id="endMinValue">120</span></label>
        <input type="range" id="endMin" min="0" max="120" value="120" style="width: 100%;">
        <table id="shotsTable"></table>
    </div>`;

    document.body.appendChild(slider);
    countShots(0, 120);  // Initial count for the full range

    // Update shot count when slider values change
    document.getElementById('startMin').addEventListener('input', function() {
        document.getElementById('startMinValue').textContent = this.value;
        countShots(parseInt(this.value), parseInt(document.getElementById('endMin').value));
    });

    document.getElementById('endMin').addEventListener('input', function() {
        document.getElementById('endMinValue').textContent = this.value;
        countShots(parseInt(document.getElementById('startMin').value), parseInt(this.value));
    });

    // Add a toggle button to show/hide the stats
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = `${translation.hideShow[language]}`;
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '300px';
    toggleButton.style.zIndex = '9999';

    toggleButton.addEventListener('click', function() {
        const scoreTable = document.getElementById('tblScore');
        scoreTable.style.display = scoreTable.style.display === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(toggleButton);
}

//National Link by ernestofv01
function nationalLink() {
    const teamLinks = {
        "alb": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23236", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23252", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23251", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23249" },
        "alg": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/43713", U17: "https://www.dugout-online.com/clubinfo/none/clubid/43716", U19: "https://www.dugout-online.com/clubinfo/none/clubid/43715", U21: "https://www.dugout-online.com/clubinfo/none/clubid/43714" },
        "arg": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13326", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13330", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13329", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15670" },
        "aus": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13331", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13333", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15861", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13332" },
        "aut": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/15672", U17: "https://www.dugout-online.com/clubinfo/none/clubid/15674", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15734", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15673" },
        "ban": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23253", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23256", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23255", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23254" },
        "bel": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13334", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13337", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13336", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13335" },
        "bol": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/19438", U17: "https://www.dugout-online.com/clubinfo/none/clubid/20767", U19: "https://www.dugout-online.com/clubinfo/none/clubid/20766", U21: "https://www.dugout-online.com/clubinfo/none/clubid/19439" },
        "bih": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13339", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13342", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13341", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13340" },
        "brz": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13343", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13346", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13345", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13344" },
        "bul": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/15675", U17: "https://www.dugout-online.com/clubinfo/none/clubid/15678", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15677", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15676" },
        "can": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23257", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23260", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23259", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23258" },
        "chi": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13347", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13350", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13349", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13348" },
        "chn": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13351", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13352", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15862", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15469" },
        "col": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13560", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13563", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13562", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13561" },
        "cro": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13353", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13356", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13355", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13354" },
        "cze": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13564", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13567", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13566", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13565" },
        "den": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13357", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13360", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13359", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13358" },
        "eng": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13361", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13364", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13363", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13362" },
        "est": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13365", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13368", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13367", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13366" },
        "fin": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13369", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13372", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13371", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13370" },
        "fra": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13373", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13376", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13375", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13374" },
        "ger": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13377", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13379", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15863", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13378" },
        "gre": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/43717", U17: "https://www.dugout-online.com/clubinfo/none/clubid/43719", U19: "https://www.dugout-online.com/clubinfo/none/clubid/43725", U21: "https://www.dugout-online.com/clubinfo/none/clubid/43718" },
        "hun": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/15680", U17: "https://www.dugout-online.com/clubinfo/none/clubid/15683", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15682", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15681" },
        "ice": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/46293", U17: "https://www.dugout-online.com/clubinfo/none/clubid/46297", U19: "https://www.dugout-online.com/clubinfo/none/clubid/46296", U21: "https://www.dugout-online.com/clubinfo/none/clubid/46294" },
        "ind": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/43730", U17: "https://www.dugout-online.com/clubinfo/none/clubid/43720", U19: "https://www.dugout-online.com/clubinfo/none/clubid/43732", U21: "https://www.dugout-online.com/clubinfo/none/clubid/43731" },
        "ire": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23261", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23264", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23263", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23262" },
        "isr": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/46289", U17: "https://www.dugout-online.com/clubinfo/none/clubid/46292", U19: "https://www.dugout-online.com/clubinfo/none/clubid/46291", U21: "https://www.dugout-online.com/clubinfo/none/clubid/46290" },
        "ita": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13380", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13383", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13382", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13381" },
        "jpn": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/15470", U17: "https://www.dugout-online.com/clubinfo/none/clubid/15571", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15472", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15471" },
        "lat": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13384", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13387", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13386", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13385" },
        "lit": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23265", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23268", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23267", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23266" },
        "mal": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/46284", U17: "https://www.dugout-online.com/clubinfo/none/clubid/46288", U19: "https://www.dugout-online.com/clubinfo/none/clubid/46287", U21: "https://www.dugout-online.com/clubinfo/none/clubid/46286" },
        "mex": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13568", U17: "https://www.dugout-online.com/clubinfo/none/clubid/15276", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15275", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13569" },
        "mol": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/43726", U17: "https://www.dugout-online.com/clubinfo/none/clubid/43729", U19: "https://www.dugout-online.com/clubinfo/none/clubid/43728", U21: "https://www.dugout-online.com/clubinfo/none/clubid/43727" },
        "net": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13388", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13391", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13390", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13389" },
        "nze": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13393", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13396", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13395", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13394" },
        "nor": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13392", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13496", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13495", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13494" },
        "per": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13497", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13500", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13499", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13498" },
        "pol": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13397", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13400", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13399", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13398" },
        "por": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13401", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13404", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13403", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13402" },
        "mtn": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/43721", U17: "https://www.dugout-online.com/clubinfo/none/clubid/43724", U19: "https://www.dugout-online.com/clubinfo/none/clubid/43723", U21: "https://www.dugout-online.com/clubinfo/none/clubid/43722" },
        "rom": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13405", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13407", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13406", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13327" },
        "rus": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23269", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23272", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23271", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23270" },
        "sco": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13467", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13470", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13469", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13468" },
        "sam": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13408", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13411", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13410", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13409" },
        "svk": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13653", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13656", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13655", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13654" },
        "slo": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13412", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13415", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13414", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13413" },
        "saf": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/43733", U17: "https://www.dugout-online.com/clubinfo/none/clubid/43736", U19: "https://www.dugout-online.com/clubinfo/none/clubid/43735", U21: "https://www.dugout-online.com/clubinfo/none/clubid/43734" },
        "sko": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13648", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13652", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13651", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13649" },
        "spa": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13416", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13419", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13418", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13417" },
        "swe": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13420", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13422", U19: "https://www.dugout-online.com/clubinfo/none/clubid/17362", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13421" },
        "sui": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23273", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23276", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23275", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23274" },
        "tha": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/23277", U17: "https://www.dugout-online.com/clubinfo/none/clubid/23280", U19: "https://www.dugout-online.com/clubinfo/none/clubid/23279", U21: "https://www.dugout-online.com/clubinfo/none/clubid/23278" },
        "tur": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13423", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13426", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13425", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13424" },
        "usa": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13428", U17: "https://www.dugout-online.com/clubinfo/none/clubid/15686", U19: "https://www.dugout-online.com/clubinfo/none/clubid/15685", U21: "https://www.dugout-online.com/clubinfo/none/clubid/15684" },
        "uru": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/13490", U17: "https://www.dugout-online.com/clubinfo/none/clubid/13493", U19: "https://www.dugout-online.com/clubinfo/none/clubid/13492", U21: "https://www.dugout-online.com/clubinfo/none/clubid/13491" },
        "ven": { NT: "https://www.dugout-online.com/clubinfo/none/clubid/19434", U17: "https://www.dugout-online.com/clubinfo/none/clubid/19437", U19: "https://www.dugout-online.com/clubinfo/none/clubid/19436", U21: "https://www.dugout-online.com/clubinfo/none/clubid/19435" },
    };

    function getTeamLink(idade, pais) {
        if (!teamLinks[pais]) {
            return null;
        }

        if (idade <= 17) {
            return teamLinks[pais].U17 || null;
        } else if (idade >= 18 && idade <= 19) {
            return teamLinks[pais].U19 || null;
        } else if (idade >= 20 && idade <= 21) {
            return teamLinks[pais].U21 || null;
        } else {
            return teamLinks[pais].NT || null;
        }

        return null;
    }

    // Função para inserir os links nas posições
    function insertTeamLinks() {
        const rows = document.querySelectorAll("table.forumline tr");
        const i = ($('.top_positions').length) ? 1 : 0;

        rows.forEach(row => {
            if (!row.cells[4 + i]) {
                return;
            }

            if (!row.cells[4 + i].querySelector("img")) {
                return;
            }
            const countryElement = row.cells[4 + i].querySelector("img");

            const age = parseInt(row.cells[3 + i].textContent);
            const country = countryElement.src.match(/\/([^\/]+)\.png$/);

            const teamLink = getTeamLink(age, country[1]);

            if (teamLink) {
                const linkElement = document.createElement('a');
                linkElement.href = teamLink;
                linkElement.target = '_blank';
                linkElement.style.textDecoration = 'none';
                linkElement.style.fontWeight = 'normal';

                countryElement.parentNode.insertBefore(linkElement, countryElement);
                linkElement.appendChild(countryElement);
            }
        });
    }

    window.addEventListener('load', function() {
        insertTeamLinks();
    });
}
function submitProScout() {
    let url = new URL(window.location.href);

    // Split the pathname by "/"
    let parts = url.pathname.split('/');

    // Extract playerID and club_id values from the URL
    let playerID = parts[parts.indexOf('playerID') + 1];
    let clubID = parts[parts.indexOf('club_id') + 1];

    // Build the new URL structure
    let newUrl = `https://www.dugout-online.com/players/details/playerID/${playerID}/clubid/youth/0/${clubID}/back/`;

    // Prepare data for the POST request
    let postData = new URLSearchParams();
    postData.append('sendscout', '1');
    postData.append('scouttype', '1');

    // Make the POST request
    fetch(newUrl, {
        method: 'POST',
        body: postData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            location.reload(); // Refresh the page on success
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function sendProScout() {
    // Create the input button
    let button = document.createElement("input");
    button.type = "button"; // Set type to button
    button.value = "Send Pro Scout"; // Set button text
    button.style.marginRight = "10px";
    button.id = "scoutProBtn";

    var scoutButton = $("input[type='button'][onclick*='sendscout']");
    if (scoutButton.is(':disabled')) {
        button.disabled = true; // Disable the button if the scout button is disabled
    }

    // Insert the new button before the existing scout button
    scoutButton.before(button);

    // Add click event listener to the button
    button.addEventListener("click", submitProScout);
}
