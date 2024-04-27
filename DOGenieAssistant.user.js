// ==UserScript==
// @name         DO Genie Assistant
// @version      35.0
// @namespace    https://github.com/edunogueira/DOGenieAssistant/
// @description  dugout-online genie assistant
// @author       Eduardo Nogueira de Oliveira
// @icon         https://www.google.com/s2/favicons?domain=dugout-online.com
// @require	 http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js
// @include      http*dugout-online.com/*
// @include      https://www.dugout-online.com/*
// ==/UserScript==
//page select ----------------------------------------------//
var page = document.URL;
var configs = getStorage(localStorage.getItem("DOGenieAssistant.configs")) || {};
var soundConfig = getSoundStorage(localStorage.getItem("DOGenieAssistant.soundConfig")) || {};

function checkAndExecute(config, func) {
    if ((config) || (typeof config === 'undefined')) {
        func();
    }
}

checkAndExecute(configs["PAGE_TITLE"], pageTitle);
checkAndExecute(configs["DROPDDOWN_MENU"], dropdownMenu);
checkAndExecute(configs["SECONDARY_CLOCK"], secondaryClock);
checkAndExecute(configs["LINKS"], links);

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
} else if (page.includes('/players/details/')) {
    playerDetails();
    checkAndExecute(configs["BID_BUTTON"], bidButton);
    checkAndExecute(configs["PLAYER_IMAGE"], playerImage);
} else if (page.includes('/players/none/') || page.includes('/players_nt/none/')) {
    checkAndExecute(configs["SQUAD_DETAILS"], squadDetails);
    checkAndExecute(configs["SQUAD_FILTERS"], squadFilters);
} else if (page.includes('/tactics/none/') || page.includes('/tactics_youth/none/') || page.includes('/tactics_nt/none/')) {
    checkAndExecute(configs["TACTICS_DETAILS"], tacticsDetails);
    checkAndExecute(configs["LOAD_TACTICS"], loadTactics);
} else if (page.includes('/players/spreadsheet/')) {
    checkAndExecute(configs["SPREADSHEET_SQUAD"], function() { doTable('.forumline'); });
} else if (page.includes('/game/none/gameid/')) {
    checkAndExecute(soundConfig["MATCH_SOUND"], matchSound);
} else if (page.match("/search_players|/search_transfers|/search_clubs|/search_coaches|/national_teams|/search_physios")) {
    checkAndExecute(storedFilters["STORED_FILTERS"], storedFilters);
} else if (page.match("/competitions/none")) {
    checkAndExecute(configs["GOALS_DIFFERENCE"], goalsDifference);
} else if (page.match("/training/none")) {
    checkAndExecute(configs["HIDE_TRAINING_REPORT"], hideTrainingReport);
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

    };
}

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
            { url: 'https://www.dugout-online.com/players/none/', text: translation.club_players[language] },
            { url: 'https://www.dugout-online.com/players/none/view/youth/', text: translation.club_players_youth[language] },
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
        const data = {
            action: 'submit',
            players_ids: players[0].join(','),
            positions: players[1].join(','),
            players_x: players[2].join(','),
            players_y: players[3].join(','),
            substitutes: substitutes[0].join(','),
            actions: actionsb,
            options: `${$("#agression_id").val()}*${$("#mentality_id option:selected").val()}*${$("#attack_wing_id option:selected").val()}*${$("#passing_id option:selected").val()}*${$("#capitan_sel option:selected").val()}*${$("#playmaker_sel option:selected").val()}*${$("#target_man_sel option:selected").val()}*${$("#penalty_sel option:selected").val()}*${$("#counter_attacks_id").prop('checked') ? '1' : '0'}*${$("#offside_trap_id").prop('checked') ? '1' : '0'}`
        };

        const queryString = $.param(data).replace(/%5B/g, '').replace(/%5D/g, '');
        const decodedQueryString = decodeURIComponent(queryString).replace(/ /g, '+');

        $("#dataTtc").val(decodedQueryString);
    });



    $("#apply").click(function() {
        const xmlhttp = new XMLHttpRequest();
        const url = page.match('/tactics/none/') ? SERVER_URL + "/ajaxphp/tactics_save.php" :
                    page.match('/tactics_youth/none/') ? SERVER_URL + "/ajaxphp/tactics_youth_save.php" :
                    page.match('/tactics_nt/none/') ? SERVER_URL + "/ajaxphp/tactics_nt_save.php" : '';

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
        if (language!="en" && language!="br") language = "en";
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
            handleEvent(match, 'LAST_GOAL', eventTime, soundConfig['HOME_GOAL_ID'], soundConfig['AWAY_GOAL_ID'], gameId);
            break;
        }

        if (soundConfig["OFFSIDE_SOUND"] !== "" && eventType.includes('icon-offside')) {
            handleEvent(match, 'LAST_OFFSIDE', eventTime, soundConfig['OFFSIDE_ID'], soundConfig['OFFSIDE_ID'], gameId);
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
                handleEvent(match, 'GAME_ENDS', gameEndsTime, soundConfig['GAME_END_ID'], soundConfig['GAME_END_ID'], gameId);
            }
        }
    }
}

function handleEvent(match, eventName, eventTime, soundIdHome, soundIdAway, gameId) {
    if (formatTime(match[eventName]) < eventTime) {
        match[eventName] = eventTime;
        localStorage.setItem(`DOGenieAssistant.match.${gameId}`, JSON.stringify(match));

        const isHomeTeam = ($("#events_content td:nth-child(3) a").eq(0).text() === $('.header_clubname').text());
        const soundId = isHomeTeam ? soundIdHome : soundIdAway;

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
        "PLAYER_OPS_NAME", "PLAYER_OPS_ID", "PLAYER_EXP", "PLAYER_IMAGE",
        "SQUAD_DETAILS", "SQUAD_FILTERS", "SQUAD_HIGH", "SPREADSHEET_SQUAD",
        "BID_BUTTON", "LOAD_TACTICS", "TACTICS_DETAILS", "LINKS",
        "STORED_FILTERS", "GOALS_DIFFERENCE", "HIDE_TRAINING_REPORT"
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
        "SQUAD_HIGH": 'checked',
        "LOAD_TACTICS": 'checked',
        "TACTICS_DETAILS": 'checked',
        "COACHES_WAGE": 'checked',
        "SCOUT_BUTTON": 'checked',
        "SPREADSHEET_SQUAD": 'checked',
        "BID_BUTTON": 'checked',
        "TEAM_LINK": 'checked',
        "GET_SPONSORS": 'checked',
        "PLAYER_IMAGE": 'checked',
        "LINKS": 'checked',
        "STORED_FILTERS": 'checked',
        "GOALS_DIFFERENCE": 'checked',
        "HIDE_TRAINING_REPORT": 'checked'
    };

    return (storageConfigs == null || storageConfigs == '[]') ? defaultConfigs : JSON.parse(storageConfigs);
}

function configSound() {
    const soundConfigOptions = [
        { name: "MATCH_SOUND", defaultValue: 'checked' },
        { name: "GOAL_SOUND", defaultValue: 'checked' },
        { name: "HOME_GOAL_ID", defaultValue: '1579437467' },
        { name: "AWAY_GOAL_ID", defaultValue: '1636248327' },
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


