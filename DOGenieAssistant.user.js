// ==UserScript==
// @name DO Genie Assistant
// @version 45.0
// @namespace https://github.com/edunogueira/DOGenieAssistant/
// @description dugout-online genie assistant
// @author n_edu (clubid/112411), mini18 (clubid/99440), lumfurt (clubid/106059), Gleybe (clubid/113526), ernestofv01 (clubid/112729), allandagama (clubid/113643)
// @icon https://www.google.com/s2/favicons?domain=dugout-online.com
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js
// @include http*dugout-online.com/*
// @include https://www.dugout-online.com/*
// @run-at document-end
// @grant none
// @inject-into page

// ==/UserScript==
//page select ----------------------------------------------//
// Ordem esperada por getOPS na versão clássica; o índice 13 é Positioning.
const v4StatOrder = ['REF','TCK','PAS','SHT','AGG','ONE','MRK','CRE','DRI','INF','HND','HEA','LSH','PSN','TMW','COM','CRS','FTO','STR','SPD','ECC'];
var page = document.URL;
var configs = getStorage(localStorage.getItem("DOGenieAssistant.configs")) || {};
var soundConfig = getSoundStorage(localStorage.getItem("DOGenieAssistant.soundConfig")) || {};
var scores = "";

checkAndExecute(configs["CHECKBOX_SWITCH"], checkboxSwitch);
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

    checkAndExecute(configs["GET_SPONSORS"], getSponsors);
} else if (/^\/search_coaches\/none(?:\/|$)/.test(location.pathname)) {
    checkAndExecute(configs["COACHES_WAGE"], coachesWage);
    checkAndExecute(configs["STORED_FILTERS"], storedFilters);
} else if (/^\/staff\/details(?:\/|$)/.test(location.pathname)) {
    checkAndExecute(configs["COACHES_WAGE"], coachesWage);
} else if (/^\/clubinfo\/none(?:\/|$)/.test(location.pathname)) {
    checkAndExecute(configs["READ_RESUME"], readResume);
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
    checkAndExecute(configs["SPREADSHEET_SQUAD"], spreadsheetSquad);
} else if (page.includes('/game/none/gameid/')) {
    checkAndExecute(soundConfig["MATCH_SOUND"], matchSound);
    checkAndExecute(configs["MATCH_NAMES"], matchNames);
    checkAndExecute(configs["MATCH_SCORE"], matchScore);
} else if (page.match("/search_players|/search_transfers|/search_clubs|/search_coaches|/national_teams|/search_physios")) {
    checkAndExecute(configs["STORED_FILTERS"], storedFilters);
} else if (page.match("/training/none")) {
    checkAndExecute(configs["HIDE_TRAINING_REPORT"], hideTrainingReport);
    checkAndExecute(configs["COACH_EFFECTIVENESS"], coachEffectiveness);
} else if (page.match("/settings/none")) {
    importExport();
} else if (page.match("/competitions/")) {
    checkAndExecute(configs["AUTO_SCORE"], autoScore);
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

function checkboxSwitch() {
    applyStyle(`
        input[type="checkbox"] {
            --genie-switch-off:var(--do-gray-500,#64748b);
            --genie-switch-on:var(--do-green,#286b2d);
            --genie-switch-thumb:#fff;
            appearance:none!important;-webkit-appearance:none!important;
            box-sizing:border-box!important;width:36px!important;height:20px!important;
            min-width:36px!important;flex-shrink:0;vertical-align:middle;
            border:1px solid transparent!important;border-radius:999px!important;
            padding:0!important;cursor:pointer;
            background:radial-gradient(circle at 9px 50%,var(--genie-switch-thumb) 7px,transparent 7.5px) var(--genie-switch-off)!important;
            box-shadow:none!important;
        }
        input[type="checkbox"]:checked {
            background:radial-gradient(circle at 25px 50%,var(--genie-switch-thumb) 7px,transparent 7.5px) var(--genie-switch-on)!important;
        }
        input[type="checkbox"]:indeterminate {
            background:radial-gradient(circle at 17px 50%,var(--genie-switch-thumb) 7px,transparent 7.5px) var(--genie-switch-off)!important;
        }
        input[type="checkbox"]:focus-visible {outline:2px solid var(--genie-switch-on)!important;outline-offset:3px!important}
        input[type="checkbox"]:disabled {opacity:.5;cursor:not-allowed}
        @media (forced-colors:active) {
            input[type="checkbox"] {appearance:auto!important;-webkit-appearance:auto!important;background:revert!important;border:revert!important}
        }
    `);
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

function squadDetails() {
    if (document.querySelector('.do-players-table')) return v4SquadDetails();
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
    if (document.querySelector('.do-players-table')) return v4SquadFilters();
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
    if (document.querySelector('.do-tac')) { v4TacticsDetails(); return; }
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

function v4TacticsDetails() {
    const data = window.DO_TAC, table = document.querySelector('.do-tac-squad');
    if (!data?.squad || !table) return;

    const aggression = document.getElementById('doTacAggression');
    const slider = aggression?.closest('.do-tac-fs');
    const label = document.getElementById('doTacAggVal');
    if (slider && label && !document.getElementById('newAgg')) {
        const input = document.createElement('input');
        input.id = 'newAgg'; input.type = 'number'; input.min = '0'; input.max = '100';
        input.value = aggression.value; input.style.cssText = 'width:4.5em;margin-left:8px';
        input.setAttribute('aria-label', slider.querySelector('.do-tac-fs-title')?.textContent.trim() || 'Aggression');
        label.after(input);
        const update = () => {
            if (input.value === '') return;
            const value = Math.max(0, Math.min(100, Math.round(Number(input.value))));
            input.value = value; aggression.value = value; label.textContent = value;
            const stage = slider.querySelector('.do-tac-fs-stage'), rect = stage?.getBoundingClientRect();
            if (rect?.width > 32 && window.PointerEvent) {
                const x = rect.left + 16 + (rect.width - 32) * value / 100;
                stage.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse', clientX: x }));
                document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' }));
            }
        };
        input.addEventListener('input', update);
        input.addEventListener('change', () => { if (input.value === '') input.value = aggression.value; else update(); });
        new MutationObserver(() => { input.value = aggression.value; }).observe(label, { childList: true, characterData: true });
    }

    if (!table.querySelector('.genie-tac-ops')) {
        const th = document.createElement('th'); th.className = 'c-num genie-tac-ops'; th.textContent = 'OPS';
        table.tHead?.rows[0]?.append(th);
        const squad = new Map(data.squad.map(player => [String(player.id), player]));
        table.querySelectorAll('tbody tr[data-id]').forEach(row => {
            const player = squad.get(row.dataset.id);
            const attrs = Object.fromEntries((player?.attrs || []).map(([key, value]) => [key.toUpperCase(), Number(value)]));
            const values = v4StatOrder.map(key => attrs[key === 'SPD' ? 'SP' : key]);
            const pos = player?.pos;
            const ops = pos && ['GK','DL','DC','DR','ML','MC','MR','FL','FC','FR'].includes(pos) && values.every(Number.isFinite)
                ? getOPS(values)[getPositionIndex(pos)] : null;
            const td = document.createElement('td'); td.className = 'c-num genie-tac-ops';
            td.textContent = ops == null ? '—' : String(ops); row.append(td);
        });
    }

    if (!document.getElementById('genie-tac-style')) {
        const style = document.createElement('style'); style.id = 'genie-tac-style';
        style.textContent = '.do-tac-squad .genie-tac-starter td,.do-tac-squad .genie-tac-starter .do-tac-squad-name{font-weight:700;text-decoration:underline}.do-tac-squad .genie-tac-sub td,.do-tac-squad .genie-tac-sub .do-tac-squad-name{font-weight:700;color:blue}';
        document.head.append(style);
    }
    const refresh = () => {
        const starters = new Set([...(data.players || []), data.gk].filter(Boolean).map(player => String(player.id)));
        const subs = new Set((data.subs || []).map(player => String(player.id)));
        table.querySelectorAll('tbody tr[data-id]').forEach(row => {
            row.classList.toggle('genie-tac-starter', starters.has(row.dataset.id));
            row.classList.toggle('genie-tac-sub', subs.has(row.dataset.id));
        });
    };
    refresh();
    // O jogo conclui o arraste em document, inclusive fora do painel de táticas.
    ['click', 'change', 'pointerup'].forEach(type => document.addEventListener(type, () => requestAnimationFrame(refresh), true));
}


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

function pageTitle() {
    let title = (location.pathname.split('/')[1] || '').replace('_', ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (/^\/clubinfo\/none(?:\/|$)/.test(location.pathname)) {
        title = document.querySelector('.do-club-name, .clubname')?.textContent.trim() || title;
    }
    if (title) document.title = title;
    return document.title;
}

function estimateCoachWage(skill) {
    return (skill <= 42 ? 24.44889 * skill - 138.145 : 51.54712 * skill - 1260) * skill;
}

function coachesWage() {
    const table = document.querySelector('.do-se-table');
    if (table) return v4CoachSearchWages(table);
    const details = document.querySelector('.do-sd');
    if (details) {
        if (!details.querySelector('.do-sd-role-coach') || document.getElementById('genie-coach-wage')) return;
        const host = details.querySelector('.do-sd-inforows');
        const attrs = Array.from(details.querySelectorAll('.do-sd-attrs .do-sd-attr')).slice(0, 4);
        const values = attrs.map(attr => Number(attr.querySelector('.do-sd-skill')?.textContent.trim()));
        if (!host || values.length !== 4 || values.some(value => !Number.isFinite(value))) return;
        const highest = Math.max(...values), wage = estimateCoachWage(highest);
        if (!Number.isFinite(wage) || wage <= 0) return;
        const row = document.createElement('div'); row.id = 'genie-coach-wage'; row.className = 'do-sd-row';
        const label = document.createElement('span'); label.className = 'do-sd-k'; label.textContent = 'Salário estimado';
        const value = document.createElement('span'); value.className = 'do-sd-v';
        value.textContent = '≈ ' + new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(wage) + ' $ / semana';
        row.title = 'Estimativa pela fórmula clássica. Maior atributo entre ' + attrs.map(attr => attr.querySelector('.do-sd-attr-k')?.textContent.trim()).join(', ') + ': ' + highest + '.';
        row.append(label, value); host.append(row);
        return;
    }
    $(".search_tbl tbody tr:first").append('<td width="36" class="table_header" valign="middle" align="center" style="cursor: default;" title="Approximate Wage">Wage</td>');

    $(".search_tbl tbody tr").each(function() {
        const data = $(this).children('td').map(function() {
            return $.isNumeric($(this).text()) ? parseInt($(this).text()) : null;
        }).get().filter(Number);

        if (data.length > 0) {
            const max = Math.max(...data.slice(1, -5));
            let wage = estimateCoachWage(max);
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

function v4CoachSearchWages(table) {
    const header = table.tHead?.rows[0], tbody = table.tBodies[0];
    if (!header || !tbody || table.querySelector('th.genie-coach-search-wage')) return;
    const columns = {};
    Array.from(header.cells).forEach(th => {
        const key = th.getAttribute('onclick')?.match(/doSeSort\s*\(\s*['"](gk|df|mf|fw)['"]\s*\)/)?.[1];
        if (key) columns[key] = th.cellIndex;
    });
    const indices = ['gk','df','mf','fw'].map(key => columns[key]);
    if (indices.some(index => index === undefined)) return;
    const th = document.createElement('th'); th.className = 'c-num do-se-sortable genie-coach-search-wage';
    th.textContent = 'Salário estimado'; th.scope = 'col'; th.tabIndex = 0;
    th.setAttribute('role', 'button'); th.setAttribute('aria-sort', 'none');
    th.title = 'Salário semanal estimado. Clique para ordenar os resultados desta página.';
    th.style.whiteSpace = 'nowrap';
    const arrow = document.createElement('span'); arrow.textContent = ' ↕'; arrow.setAttribute('aria-hidden', 'true'); th.append(arrow);
    header.append(th);
    const format = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const wages = new Map();
    Array.from(tbody.rows).forEach(row => {
        if (row.cells.length === 1 && row.cells[0].colSpan > 1) { row.cells[0].colSpan = header.cells.length; return; }
        const values = indices.map(index => {
            const raw = row.cells[index]?.textContent.trim(); return /^\d+$/.test(raw || '') ? Number(raw) : NaN;
        });
        const estimate = values.every(Number.isFinite) ? estimateCoachWage(Math.max(...values)) : NaN;
        const wage = Number.isFinite(estimate) && estimate > 0 ? estimate : null;
        wages.set(row, wage);
        const cell = row.insertCell(); cell.className = 'c-num genie-coach-search-wage';
        cell.style.cssText = 'white-space:nowrap;text-align:right';
        cell.textContent = wage === null ? '—' : '≈ ' + format.format(wage) + ' $';
        cell.title = 'Estimativa pela fórmula clássica, usando o maior valor entre GKC, DFC, MFC e FWC.';
    });
    let ascending = true;
    const sort = () => {
        Array.from(wages.keys()).sort((a, b) => {
            const left = wages.get(a), right = wages.get(b);
            if (left === null) return right === null ? 0 : 1;
            if (right === null) return -1;
            return (ascending ? 1 : -1) * (left - right);
        }).forEach(row => tbody.append(row));
        th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
        arrow.textContent = ascending ? ' ▲' : ' ▼'; ascending = !ascending;
    };
    th.addEventListener('click', sort);
    th.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); sort(); }
    });
}

function readResume() {
    if (document.getElementById('genie-read-resume')) return;
    const manager = document.querySelector('.do-club-info-left a[href*="/toid/"], .maninfo a[href*="/toid/"]');
    const id = manager?.href.match(/\/toid\/(\d+)(?:\/|[?#]|$)/)?.[1];
    const actions = document.querySelector('.do-club-actions'), host = actions || document.querySelector('.clubname');
    if (!id || !host) return;
    const link = document.createElement('a'); link.id = 'genie-read-resume';
    link.href = location.origin + '/readresume.php?id=' + id;
    link.textContent = actions ? 'Read Resume' : ' [Read Resume]';
    if (actions) link.className = 'do-btn do-btn-sm do-btn-secondary';
    host.append(link);
}

function scoutButton() {
    const actions = document.querySelector('.do-club-actions');
    if (actions) {
        if (document.getElementById('genie-scout-report') || actions.querySelector('a[href*="/clubinfo/analysis/"]')) return;
        const clubLink = actions.querySelector('a[href*="/clubid/"]');
        const id = location.pathname.match(/\/clubid\/(\d+)(?:\/|$)/)?.[1] || clubLink?.href.match(/\/clubid\/(\d+)(?:\/|[?#]|$)/)?.[1];
        if (!id) return;
        const link = document.createElement('a'); link.id = 'genie-scout-report';
        link.href = location.origin + '/clubinfo/analysis/clubid/' + id;
        link.className = 'do-btn do-btn-sm do-btn-secondary'; link.textContent = 'Relatório do espião';
        actions.append(link);
        return;
    }
    const clubid = $("a[href^='https://www.dugout-online.com/clubinfo/none/clubid/']:eq(1)").attr('href').split('clubid/')[1];

    const rowIndex = $('table tbody tr').length - 18;
    $('table > tbody > tr:eq(' + rowIndex + ')').append(`
        <td valign="middle" style="padding-left: 25px; padding-right: 1px;">
            <input type="button" value="Relatório do espião" onclick="document.location.href='https://www.dugout-online.com/clubinfo/analysis/clubid/${clubid}'">
        </td>
    `);
}

function loadTactics() {
    if (document.querySelector('.do-tac')) { v4LoadTactics(); return; }
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

function v4TacticsData() {
    const data = window.DO_TAC;
    if (!data?.players || data.players.length !== 10 || !data.gk) return '';
    const players = [...data.players, data.gk];
    const value = id => document.getElementById(id)?.value ?? '0';
    const checked = id => document.getElementById(id)?.checked ? 1 : 0;
    const roles = data.roles || {};
    const options = [value('doTacAggression'), value('doTacMentality'), value('doTacWing'), value('doTacPassing'),
        roles.captain?.id || 0, roles.playmaker?.id || 0, roles.target?.id || 0, roles.penalty?.id || 0,
        checked('doTacCounter'), checked('doTacOffside')];
    return new URLSearchParams({
        action: 'submit',
        players_ids: players.map(player => player.id).join(','),
        positions: [...data.players.map(player => player.code || 0), 0].join(','),
        players_x: [...data.players.map(player => Math.round(player.xRef)), 0].join(','),
        players_y: [...data.players.map(player => Math.round(player.yRef)), 0].join(','),
        substitutes: (data.subs || []).map(player => player.id).join(','),
        actions: (data.actions || []).join(','),
        options: options.join('*')
    }).toString();
}

function v4LoadTactics() {
    const saveBlock = document.getElementById('doTacSaveBlock'), data = window.DO_TAC;
    if (!saveBlock || !data || document.getElementById('dataTtc')) return;
    const block = document.createElement('div'); block.className = 'do-tac-block genie-tac-transfer';
    block.innerHTML = '<textarea id="dataTtc" rows="3" style="width:100%;box-sizing:border-box"></textarea>' +
        '<div class="do-tac-actions"><button type="button" class="do-btn do-btn-outline do-btn-sm" id="getTtc">getTtc</button>' +
        '<button type="button" class="do-btn do-btn-outline do-btn-sm" id="apply">Apply</button>' +
        '<span id="genie-tac-message" role="status"></span></div>';
    saveBlock.after(block);
    const textarea = block.querySelector('#dataTtc'), apply = block.querySelector('#apply'), message = block.querySelector('#genie-tac-message');
    block.querySelector('#getTtc').addEventListener('click', () => {
        textarea.value = v4TacticsData(); textarea.focus(); textarea.select();
    });
    apply.addEventListener('click', async () => {
        const source = new URLSearchParams(textarea.value.trim());
        const numeric = (key, count) => source.has(key) && source.get(key).split(',').length === count &&
            source.get(key).split(',').every(value => /^\d+$/.test(value));
        if (!numeric('players_ids', 11) || !numeric('positions', 11) || !numeric('players_x', 11) ||
            !numeric('players_y', 11) || !source.has('substitutes') || !source.has('actions') ||
            !source.has('options') || source.get('options').split('*').length !== 10) {
            message.textContent = data.i18n?.failed || 'Invalid tactics data'; return;
        }
        const payload = new URLSearchParams({ action: 'submit' });
        ['players_ids','positions','players_x','players_y','substitutes','actions','options'].forEach(key => payload.set(key, source.get(key)));
        apply.disabled = true; message.textContent = '';
        try {
            const endpoint = new URL(data.endpoint, data.serverUrl || location.href);
            if (endpoint.origin !== location.origin) throw new Error('Invalid tactics endpoint');
            const response = await fetch(endpoint.href, { method: 'POST', credentials: 'same-origin',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload.toString() });
            if (!response.ok) throw new Error('Tactics request failed');
            message.textContent = data.i18n?.submitted || 'Applied';
            location.reload();
        } catch (error) {
            console.error('[DO Genie] apply tactics', error);
            message.textContent = data.i18n?.failed || 'Tactics request failed';
            apply.disabled = false;
        }
    });
}

function bidButton() {
    const input = document.getElementById('riseoffer_input') || document.querySelector('input[name="riseoffer"]');
    const form = document.forms.namedItem('bidForm') || input?.form;
    const field = form?.querySelector('input[name="riseoffer"]');
    if (!input || !field || document.getElementById('bid1')) return;
    const minimum = Number(String(input.dataset.min || input.value).replace(/\D/g, ''));
    if (!Number.isSafeInteger(minimum) || minimum <= 0) return;
    const current = Math.max(0, minimum - 1000);
    const amounts = [current + 100000, current < 2000000 ? Math.floor(current * 1.5) : current + 1000000];
    const label = getTranslation().bid[getLanguage()] || 'Bid';
    const format = new Intl.NumberFormat();
    const group = document.createElement('div');
    group.className = 'genie-bid-buttons'; group.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px';
    amounts.forEach((value, index) => {
        const amount = Math.max(minimum, value);
        const button = document.createElement('button');
        button.type = 'button'; button.id = 'bid' + (index + 1);
        button.className = 'do-btn do-btn-outline do-btn-sm';
        button.textContent = label + ' ' + format.format(amount);
        button.addEventListener('click', () => {
            input.value = field.value = String(amount);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            if (input.id === 'riseoffer_input' && typeof window.doPdRaiseBid === 'function') window.doPdRaiseBid();
            else if (form.requestSubmit) form.requestSubmit();
            else form.submit();
        });
        group.append(button);
    });
    const submit = document.querySelector('[onclick*="doPdRaiseBid"]') || form.querySelector('[type="submit"]');
    if (submit) submit.after(group);
    else form.append(group);
}

function bidLocalTime() {
    const deadline = document.querySelector('.do-pd-bid-left[data-ends]');
    if (deadline) {
        const timestamp = Number(deadline.dataset.ends), date = new Date(timestamp * 1000);
        if (!Number.isFinite(timestamp) || timestamp <= 0 || Number.isNaN(date.getTime()) || document.querySelector('.genie-bid-local-time')) return;
        const local = document.createElement('span'); local.className = 'genie-bid-local-time';
        local.textContent = ` (${addZero(date.getDate())}-${addZero(date.getMonth() + 1)} ${addZero(date.getHours())}:${addZero(date.getMinutes())})`;
        local.style.whiteSpace = 'nowrap'; local.title = date.toLocaleString();
        deadline.title = local.title;
        deadline.after(local);
        return;
    }
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



function replacePlayerImg(url) {
    const playerImg = $(".tabbed_pane img").eq(1);
    playerImg.attr("src", url).css({ width: "150px", height: "150px" });
}


function getSponsors() {
    // shortcut: a página v4 de patrocinadores não foi fornecida; validar o fluxo antes de enviar requisições automáticas.
    if (document.querySelector('.do-user-bar')) return;
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
    if (document.querySelector('#doMvCommentary')) return v4MatchSound();
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
    if (document.querySelector('#doMvCommentary')) return v4MatchNames();
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


function defaultConfigStorage() {
    $("#defaultConfigStorage").click(function(e) {
        localStorage.removeItem("DOGenieAssistant.configs")
        e.preventDefault();
    });
}

function getStorage(storageConfigs) {
    const defaultConfigs = {
        "CHECKBOX_SWITCH": 'checked',
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
        "GET_SPONSORS": 'checked',
        "PLAYER_IMAGE": 'checked',
        "SEND_PRO_SCOUT": 'checked',
        "LINKS": 'checked',
        "STORED_FILTERS": 'checked',
        "HIDE_TRAINING_REPORT": 'checked',
        "COACH_EFFECTIVENESS": 'checked',
        "MATCH_NAMES": 'checked',
        "MATCH_SCORE": 'checked',
        "WRAP_TEXT": 'checked',
        "AUTO_SCORE": 'checked',
    };

    return (storageConfigs == null || storageConfigs == '[]') ? defaultConfigs : JSON.parse(storageConfigs);
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


//storedFilters by mini18
function storedFilters() {
    const form = document.getElementById('doSeForm');
    if (form) return v4StoredFilters(form);
    if (!document.querySelector('#filter_div')) return;
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

function v4StoredFilters(form) {
    if (document.getElementById('genie-stored-filters')) return;
    const route = location.pathname.match(/^\/(search_players|search_transfers|search_clubs|search_coaches|national_teams|search_physios)(?:\/|$)/)?.[1];
    if (!route) return;
    const key = 'DOGenieAssistant.storedFilters';
    const fields = Array.from(form.querySelectorAll('input[name]:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]), select[name], textarea[name]'));
    const snapshot = () => {
        const data = new FormData(form);
        return Object.fromEntries([...new Set(fields.map(field => field.name))].map(name => [name, data.getAll(name)]));
    };
    const defaults = snapshot();
    const bar = document.createElement('div'); bar.id = 'genie-stored-filters'; bar.className = 'do-panel';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px;margin-bottom:12px';
    const label = document.createElement('label'); label.textContent = 'Filtros salvos'; label.htmlFor = 'genie-filter-select';
    const select = document.createElement('select'); select.id = 'genie-filter-select'; select.className = 'do-select do-select-sm';
    select.style.cssText = 'width:auto;max-width:100%';
    const save = document.createElement('button'); save.id = 'genie-filter-save'; save.type = 'button';
    save.className = 'do-btn do-btn-outline do-btn-sm'; save.textContent = 'Salvar filtro';
    const remove = document.createElement('button'); remove.id = 'genie-filter-delete'; remove.type = 'button';
    remove.className = 'do-btn do-btn-danger do-btn-sm'; remove.textContent = 'Excluir filtro';
    const status = document.createElement('span'); status.setAttribute('role', 'status');
    bar.append(label, select, save, remove, status); form.prepend(bar);
    const read = () => {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid saved filters');
        if (data[route] !== undefined && (!data[route] || typeof data[route] !== 'object' || Array.isArray(data[route]))) throw new Error('Invalid saved filters');
        return data;
    };
    const failed = error => {
        console.error('[DO Genie] storedFilters', error);
        status.textContent = 'Não foi possível ler ou salvar os filtros. Os dados existentes foram preservados.';
    };
    const refresh = name => {
        const presets = read()[route] || {};
        select.replaceChildren(new Option('Padrão', 'default'));
        Object.keys(presets).filter(name => name !== 'default').forEach(name => select.add(new Option(name, name)));
        select.value = name; remove.disabled = select.value === 'default';
    };
    const load = name => {
        let values = read()[route]?.[name] ?? (name === 'default' ? defaults : null);
        if (Array.isArray(values)) {
            // shortcut: só o formato clássico de técnicos foi validado; mapear as outras buscas quando seus HTMLs forem fornecidos.
            if (route !== 'search_coaches' || values.length !== 26) {
                if (name === 'default') values = defaults;
                else { status.textContent = 'Este filtro clássico foi preservado, mas ainda precisa ser adaptado a esta busca.'; return; }
            } else {
                const names = ['namecont','dirid','from','sortby','sortord','agemin','agemax', ...['gk','df','mf','fw','tac','mot','phy','yng','jpt'].flatMap(skill => [skill + 'min', skill + 'max']), 'unempl'];
                values = Object.fromEntries(names.map((field, index) => [field, field === 'unempl' ? (values[index] ? ['1'] : []) : [String(values[index] ?? '')]]));
            }
        }
        if (!values || typeof values !== 'object' || Object.values(values).some(value => !Array.isArray(value) || value.some(item => typeof item !== 'string'))) throw new Error('Invalid filter fields');
        let unavailable = false;
        fields.forEach(field => {
            if (!Object.prototype.hasOwnProperty.call(values, field.name)) return;
            const selected = values[field.name];
            if (field.type === 'checkbox' || field.type === 'radio') field.checked = selected.includes(field.value);
            else if (field.multiple) Array.from(field.options).forEach(option => { option.selected = selected.includes(option.value); });
            else {
                const value = selected[0] ?? '';
                if ((field.tagName === 'SELECT' && !Array.from(field.options).some(option => option.value === value)) || (field.type === 'number' && value !== '' && !Number.isFinite(Number(value)))) { unavailable = true; return; }
                field.value = value;
            }
            field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new Event('change', { bubbles: true }));
        });
        const page = form.elements.namedItem('pagenum'); if (page) page.value = '1';
        status.textContent = unavailable ? 'Filtro carregado; alguns valores não estão disponíveis nesta busca.' : 'Filtro carregado.';
    };
    select.addEventListener('change', () => {
        remove.disabled = select.value === 'default';
        try { load(select.value); } catch (error) { failed(error); }
    });
    save.addEventListener('click', () => {
        const name = prompt('Nome do filtro:')?.trim(); if (!name) return;
        try {
            const data = read(), presets = data[route] || {};
            if (name === 'default' || Object.prototype.hasOwnProperty.call(presets, name)) { status.textContent = 'Esse nome já existe ou é reservado. Escolha outro nome.'; return; }
            data[route] = { ...presets, [name]: snapshot() };
            localStorage.setItem(key, JSON.stringify(data)); refresh(name); status.textContent = 'Filtro salvo.';
        } catch (error) { failed(error); }
    });
    remove.addEventListener('click', () => {
        const name = select.value; if (name === 'default' || !confirm('Excluir o filtro "' + name + '"?')) return;
        try {
            const data = read(); delete data[route][name]; localStorage.setItem(key, JSON.stringify(data));
            refresh('default'); load('default'); status.textContent = 'Filtro excluído.';
        } catch (error) { failed(error); }
    });
    try { refresh('default'); } catch (error) { failed(error); select.disabled = save.disabled = remove.disabled = true; }
}

function hideTrainingReport() {
    if (document.querySelector('.do-tr-prow')) return v4HideTrainingReport();
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
    if (document.querySelector('.do-tr-coach')) return v4CoachEffectiveness();
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
    if (document.querySelector('.do-fixtures-panel')) return v4AutoScore();
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

        const goalsHome = html.getElementById("goals_home")?.textContent || html.querySelector('.do-mv-score-nums b:first-child')?.textContent;
        const goalsAway = html.getElementById("goals_away")?.textContent || html.querySelector('.do-mv-score-nums b:last-child')?.textContent;

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

    const v4 = !!document.querySelector('#doMvCommentary');
    const gameHeader = document.querySelectorAll('.game_general');
    const score = document.querySelectorAll('.do-mv-score-nums b');
    const homeTeam = (v4 ? document.querySelector('.do-mv-team.home .do-mv-team-name')?.textContent : gameHeader[1]?.textContent)?.trim().toLowerCase();
    const goalsHomeTeam = (v4 ? score[0]?.textContent : gameHeader[2]?.textContent)?.trim().toLowerCase();
    const goalsAwayTeam = (v4 ? score[1]?.textContent : gameHeader[3]?.textContent)?.trim().toLowerCase();
    const awayTeam = (v4 ? document.querySelector('.do-mv-team.away .do-mv-team-name')?.textContent : gameHeader[4]?.textContent)?.trim().toLowerCase();
    const events = document.querySelectorAll(v4 ? '#doMvCommentary table tr' : '#events_content table tbody tr');
    if (!homeTeam || !awayTeam || !goalsHomeTeam || !goalsAwayTeam || !events.length || document.getElementById('tblScore')) return;

    let language = getLanguage();
    const translation = getTranslation();
    const statRows = [
        ['total', 'shoots'], ['onTarget', 'onTarget'], ['offTarget', 'offTarget'],
        ['corners', 'corners'], ['offsides', 'offsides'], ['foul', 'fouls'],
        ['yellow', 'yellowCards'], ['red', 'redCards']
    ];

    function classifyEvent(eventText) {
        const matches = keywords => keywords.some(keyword => eventText.includes(keyword));
        const blockedFreeKick = eventText.includes('blocks the shot') && eventText.includes('free kick');
        const isOffTarget = !blockedFreeKick && matches(offTargetKeywords);
        const isSaved = blockedFreeKick || matches(onTargetKeywords);
        const validShot = matches(shotKeywords) && !matches(illegalKeywords);
        return {
            onTarget: validShot && !isOffTarget && isSaved,
            offTarget: validShot && isOffTarget,
            offsides: matches(offsideKeywords) && !matches(legalKeywords),
            corners: matches(cornersKeywords),
            foul: matches(foulKeywords) && !eventText.includes('no foul') && !eventText.includes('play on'),
            yellow: matches(yellowKeywords),
            red: matches(redKeywords)
        };
    }

    function countShots(startMin, endMin) {
        const homeTeamShots = { onTarget: 0, offTarget: 0, offsides: 0, corners: 0, foul: 0, yellow: 0, red: 0 };
        const awayTeamShots = { ...homeTeamShots };
        for (const event of events) {
            const gameTime = parseFloat((event.querySelector('td:nth-child(2) b')?.textContent || '').replace(/[^\d:]/g, '').split(':')[0]);
            if (!(gameTime >= startMin && gameTime <= endMin)) continue;
            const eventText = event.innerText.toLowerCase().trim();
            const eventClub = v4 ? event.querySelector('td:nth-child(3) a[href*="/clubinfo/"]')?.textContent.trim().toLowerCase() : null;
            const isHomeTeam = v4 ? eventClub === homeTeam : eventText.includes(homeTeam);
            const isAwayTeam = v4 ? eventClub === awayTeam : eventText.includes(awayTeam);
            const teamShots = isHomeTeam ? homeTeamShots : isAwayTeam ? awayTeamShots : null;
            if (!teamShots) continue;
            const stats = classifyEvent(eventText);
            Object.keys(stats).forEach(key => { if (stats[key]) teamShots[key]++; });
        }
        homeTeamShots.total = homeTeamShots.onTarget + homeTeamShots.offTarget;
        awayTeamShots.total = awayTeamShots.onTarget + awayTeamShots.offTarget;
        document.querySelector('#shotsTable').innerHTML = `
            <table class="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th class="player_ratings_header">${homeTeam.toUpperCase()}</th>
                        <th class="player_ratings_header">${goalsHomeTeam.toUpperCase()} vs ${goalsAwayTeam.toUpperCase()}</th>
                        <th class="player_ratings_header">${awayTeam.toUpperCase()}</th>
                    </tr>
                </thead>
                <tbody>${statRows.map(([key, label], index) => `
                    <tr class="table_row_static${index % 2 + 1}">
                        <td>${homeTeamShots[key]}</td>
                        <th>${translation[label][language]}${key === 'foul' ? '*' : ''}</th>
                        <td>${awayTeamShots[key]}</td>
                    </tr>`).join('')}
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
        <div id="shotsTable"></div>
    </div>`;

    if (v4) {
        slider.className = 'do-panel genie-match-score';
        slider.innerHTML = `<style>
            .genie-match-score{margin:0 0 12px;min-width:0}
            .genie-match-score .do-panel-header{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
            .genie-match-score #tblScore{position:static!important;width:auto!important;background:transparent!important;padding:12px!important}
            .genie-match-score input[type=range]{display:block;max-width:100%;margin:8px 0 12px;accent-color:var(--do-green-600,#387b42)}
            .genie-match-score #shotsTable table{width:100%;table-layout:fixed;border-collapse:collapse;color:inherit}
            .genie-match-score #shotsTable th,.genie-match-score #shotsTable td{padding:8px 6px;text-align:center;overflow-wrap:anywhere;background:transparent;color:inherit;border-bottom:1px solid var(--do-gray-200,#e5e7eb)}
            .genie-match-score #shotsTable thead{background:var(--do-gray-100,#f3f4f6)}
            .genie-match-score #shotsTable tbody th{font-weight:500}
            .genie-match-score #shotsTable tbody td{font-weight:700;font-variant-numeric:tabular-nums}
        </style><div class="do-panel-header"><h2 class="do-panel-title">MATCH SCORE</h2></div>` + slider.innerHTML;
        slider.querySelector('#tblScore').className = 'do-panel-body';
        document.querySelector('#doMvCommentary').closest('.do-panel').before(slider);
    } else {
        document.body.appendChild(slider);
    }
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
    toggleButton.type = 'button';
    toggleButton.innerHTML = `${translation.hideShow[language]}`;
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '300px';
    toggleButton.style.zIndex = '9999';
    toggleButton.setAttribute('aria-controls', 'tblScore');
    toggleButton.setAttribute('aria-expanded', 'true');

    toggleButton.addEventListener('click', function() {
        const scoreTable = document.getElementById('tblScore');
        scoreTable.style.display = scoreTable.style.display === 'none' ? 'block' : 'none';
        toggleButton.setAttribute('aria-expanded', String(scoreTable.style.display !== 'none'));
    });

    if (v4) {
        toggleButton.className = 'do-btn do-btn-outline do-btn-sm';
        toggleButton.removeAttribute('style');
        slider.querySelector('.do-panel-header').appendChild(toggleButton);
    } else {
        document.body.appendChild(toggleButton);
    }
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
        const v4 = !!document.querySelector('.do-players-table');
        const rows = document.querySelectorAll(v4 ? '.do-players-table tbody tr' : 'table.forumline tr');
        const i = ($('.top_positions').length) ? 1 : 0;

        rows.forEach(row => {
            const countryElement = v4 ? row.querySelector('.do-col-nat img') : row.cells[4 + i]?.querySelector('img');
            const age = parseInt(v4 ? row.querySelector('.do-col-age')?.textContent : row.cells[3 + i]?.textContent, 10);
            const country = countryElement?.src.match(/\/([^\/]+)\.png(?:\?|$)/);
            if (!country || !Number.isFinite(age) || countryElement.closest('a')) return;
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

    insertTeamLinks();
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
    if (document.getElementById('scoutProBtn')) return;
    if (document.querySelector('.do-pd')) {
        const panel = document.getElementById('doPdScoutPanel');
        const pro = Array.from(panel?.querySelectorAll('[onclick*="doPdSendScout"]') || [])
            .find(button => /doPdSendScout\s*\(\s*['"]?1['"]?\s*[,)]/.test(button.getAttribute('onclick')));
        const actions = document.querySelector('.do-pd-actions');
        if (!pro || !actions) return;
        const button = document.createElement('button');
        button.type = 'button'; button.id = 'scoutProBtn'; button.textContent = 'Send Pro Scout';
        button.className = 'do-btn do-btn-outline do-btn-sm';
        const sync = () => { button.disabled = pro.disabled || !pro.isConnected; };
        sync();
        button.addEventListener('click', () => { if (!button.disabled) pro.click(); });
        const trigger = actions.querySelector('[onclick*="doPdScoutPanel"]');
        if (trigger) trigger.before(button); else actions.append(button);
        new MutationObserver(sync).observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
        return;
    }
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

/* Adaptadores da interface v4. As funções acima continuam atendendo à versão clássica. */
function checkAndExecute(config, func) {
    if (config === '' || config === false || config === null) return;
    try { func(); } catch (error) { console.error('[DO Genie] ' + func.name, error); }
}
function getLanguage() {
    const el = document.querySelector('.do-user-bar-settings, .settings_button');
    const label = el && (el.getAttribute('data-do-tooltip') || el.title);
    return ({Postavke:'bh',Settings:'en',Configuraciones:'es',Impostazioni:'it',Instellingen:'nl',Configurações:'br',Setări:'ro',Nastavitve:'sl',Ayarlar:'tr','설정':'ko'})[label] || 'en';
}
function genieEnabled(key) { return configs[key] !== '' && configs[key] !== false && configs[key] !== null; }
function genieRead(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v && typeof v === 'object' && !Array.isArray(v) ? v : fallback; }
    catch (error) { console.warn('[DO Genie] Dados inválidos em ' + key, error); return fallback; }
}
function genieUI() {
    if (document.getElementById('genie-v4-style')) return;
    const style = document.createElement('style'); style.id = 'genie-v4-style';
    style.textContent = `
.genie-panel.do-panel .genie-grid{grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))}.genie-panel.do-panel .genie-grid label{flex-wrap:wrap;overflow-wrap:anywhere;min-width:0}.genie-panel.do-panel input[type=text]{box-sizing:border-box;max-width:100%;min-width:0}.genie-panel.do-panel .do-btn{margin:4px 4px 4px 0}
.genie-panel:not(.do-panel){box-sizing:border-box;max-width:1100px;margin:16px auto 40px;padding:16px;background:#fff;color:#243442;border:1px solid #ccd3d9;border-radius:8px;font:14px/1.5 sans-serif}
.genie-panel summary{cursor:pointer;font-weight:bold}.genie-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0}.genie-grid label{display:flex;align-items:center;gap:8px}.genie-panel button:not(.do-btn){margin:4px;padding:5px 10px;cursor:pointer}.genie-panel input[type=text]{max-width:160px}.genie-nav{position:relative;display:inline-flex;align-items:center;height:32px}.genie-nav>.do-nav-item{padding-right:6px}.genie-nav-toggle{height:32px;min-width:28px;padding:0 7px;border:0;background:transparent;color:#fff;font:700 18px/1 sans-serif;cursor:pointer}.genie-nav:hover>.genie-nav-toggle,.genie-nav:focus-within>.genie-nav-toggle,.genie-nav.open>.genie-nav-toggle{background:#286b2d}.genie-nav-list{display:none;position:absolute;top:100%;left:0;min-width:190px;max-height:70vh;overflow:auto;background:#fff;color:#222;border:1px solid #ccd3d9;box-shadow:0 4px 14px #0003;z-index:1200}.genie-nav:hover>.genie-nav-list,.genie-nav:focus-within>.genie-nav-list,.genie-nav.open>.genie-nav-list{display:block}.genie-nav-list a{display:block;padding:8px 12px;color:#222;text-decoration:none}.genie-nav-list a:hover,.genie-nav-list a:focus{background:#eee}.genie-photo{margin:8px 0;display:flex;gap:4px;align-items:center;flex-wrap:wrap}.genie-photo input{width:110px}.genie-extra{font-size:12px;margin-left:6px;white-space:normal}.genie-bookmark{border:0;background:transparent;color:inherit;cursor:pointer;font-size:22px}.genie-clock{white-space:nowrap;font-variant-numeric:tabular-nums}
.genie-filters{display:flex;flex-wrap:wrap;align-items:end;gap:10px;margin:12px 0;padding:10px;background:#fff;border:1px solid #ccd3d9;border-radius:8px}.genie-filters label{display:flex;flex-direction:column;gap:3px;font-size:12px}.genie-filters input{width:78px}.genie-ops{text-align:center;font-weight:600}.genie-training-controls{display:flex;align-items:center;gap:8px;margin:10px 0;flex-wrap:wrap}
.do-header:has(.genie-nav:hover),.do-header:has(.genie-nav:focus-within),.do-header:has(.genie-nav.open){z-index:1050}
.genie-bookmark.do-header-icon{flex:none;border:0;padding:0;color:#fff;font-size:22px;line-height:1;background:rgba(255,255,255,.1)}.genie-bookmark.do-header-icon:hover{background:rgba(255,255,255,.25)}.genie-bookmark.do-header-icon[aria-pressed="true"]{color:#ffd166}.do-user-bar>.genie-bookmark{order:2}.do-user-bar:has(>.genie-bookmark){min-width:0}
.genie-links-page .window1_wrapper,.genie-links-page .window1_header,.genie-links-page .window1_content,.genie-links-page .window1_content_inside{max-width:100%;box-sizing:border-box}.genie-links-page .window1_header_text{font-size:18px;font-weight:700;padding:0 0 12px}.genie-links-page .tabs_content{display:flex;gap:6px;flex-wrap:wrap;padding-bottom:12px}.genie-links-page .tabs_start,.genie-links-page #links1,.genie-links-page #links3,.genie-links-page #friends1,.genie-links-page #friends3{display:none}
.genie-links-page #links2,.genie-links-page #friends2{padding:7px 12px;border:1px solid var(--panel-border,#ccd3d9);border-radius:var(--radius-sm,4px);cursor:pointer;font-weight:600}.genie-links-page #links2[class*="tab_on"],.genie-links-page #friends2[class*="tab_on"]{background:var(--do-green,#286b2d);color:#fff}
#genie-links{margin:4px 0 12px;min-width:0}#genie-links .do-panel-title{padding:0}#genie-links .do-table-wrapper{max-width:100%;overflow-x:auto}.genie-links-table{table-layout:fixed;min-width:540px}.genie-links-table th:first-child{width:40%}.genie-links-table th:last-child{width:160px}.genie-links-table td{overflow-wrap:anywhere}.genie-links-actions{display:flex;gap:6px}.genie-links-empty{text-align:center;padding:20px}
`;
    document.head.append(style);
}
function geniePanel(id, title) {
    genieUI();
    let box = document.getElementById(id); if (box) return box;
    box = document.createElement('details'); box.id = id; box.className = 'genie-panel';
    const heading = document.createElement('summary'); heading.textContent = title; box.append(heading);
    if (document.querySelector('.do-home-dashboard')) {
        box.classList.add('do-panel', 'do-home-panel');
        box.style.cssText = 'margin:16px 0 40px;min-width:0';
        heading.className = 'do-panel-header';
        const text = document.createElement('span'); text.className = 'do-panel-title'; text.textContent = title;
        heading.replaceChildren(text);
        box.addEventListener('toggle', () => heading.setAttribute('aria-expanded', String(box.open)));
        heading.setAttribute('aria-expanded', 'false');
    }
    (document.querySelector('#content_main') || document.body).append(box); return box;
}
function genieButton(parent, text, callback) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click', callback); parent.append(b); return b;
}
function configMenu() {
    const panel = geniePanel('genie-config', 'DO Genie Assistant — Configurações');
    if (panel.querySelector('form')) return;
    const form = document.createElement('form'); const grid = document.createElement('div'); grid.className = 'genie-grid';
    if (panel.classList.contains('do-panel')) form.className = 'do-panel-body';
    Object.keys(getStorage(null)).forEach(key => {
        const label = document.createElement('label'), input = document.createElement('input');
        input.type = 'checkbox'; input.name = key; input.checked = genieEnabled(key);
        label.append(input, document.createTextNode(key.split('_').join(' '))); grid.append(label);
    });
    form.append(grid); panel.append(form);
    const status = document.createElement('span'); status.setAttribute('role','status');
    genieButton(form, 'Salvar', () => {
        form.querySelectorAll('input[type=checkbox]').forEach(i => configs[i.name] = i.checked ? 'checked' : '');
        localStorage.setItem('DOGenieAssistant.configs', JSON.stringify(configs)); status.textContent = ' Salvo. Recarregue a página para aplicar.';
    });
    genieButton(form, 'Restaurar padrões', () => { localStorage.removeItem('DOGenieAssistant.configs'); location.reload(); });
    genieButton(form, 'Limpar fotos', () => {
        Object.keys(localStorage).filter(k => k.startsWith('DOGenieAssistant.player.')).forEach(k => localStorage.removeItem(k)); status.textContent = ' Fotos removidas.';
    });
    // Reutiliza a rotina de patrocinadores original; endpoints ainda não validados.
    if (genieEnabled('GET_SPONSORS') && !document.querySelector('.do-user-bar')) {
        const b = genieButton(form, 'Get Sponsors', () => sendSponsorsRequest()); b.id = 'getSponsors';
    }
    form.append(status); form.addEventListener('submit', e => e.preventDefault());
    if (panel.classList.contains('do-panel')) form.querySelectorAll('button').forEach(button => button.className = 'do-btn do-btn-outline do-btn-sm');
}
function configSound() {
    const panel = geniePanel('genie-sound', 'DO Genie Assistant — Sons');
    if (panel.querySelector('form')) return;
    const form = document.createElement('form'), grid = document.createElement('div'); grid.className = 'genie-grid';
    if (panel.classList.contains('do-panel')) form.className = 'do-panel-body';
    const values = Object.assign({}, getSoundStorage(null), soundConfig);
    Object.keys(values).forEach(key => {
        const label = document.createElement('label'), input = document.createElement('input'); input.name = key;
        input.type = key.endsWith('_ID') ? 'text' : 'checkbox';
        if (input.type === 'checkbox') input.checked = values[key] !== '' && values[key] !== false;
        else input.value = values[key];
        label.append(document.createTextNode(key.split('_').join(' ')), input); grid.append(label);
    });
    form.append(grid); panel.append(form);
    const status = document.createElement('span'); status.setAttribute('role','status');
    genieButton(form, 'Salvar sons', () => {
        form.querySelectorAll('input').forEach(i => values[i.name] = i.type === 'checkbox' ? (i.checked ? 'checked' : '') : i.value);
        soundConfig = values; localStorage.setItem('DOGenieAssistant.soundConfig', JSON.stringify(values)); status.textContent = ' Salvo.';
    });
    genieButton(form, 'Limpar histórico de sons', () => Object.keys(localStorage).filter(k => k.startsWith('DOGenieAssistant.match.')).forEach(k => localStorage.removeItem(k)));
    genieButton(form, 'Restaurar sons', () => { localStorage.removeItem('DOGenieAssistant.soundConfig'); location.reload(); });
    form.append(status); form.addEventListener('submit', e => e.preventDefault());
    if (panel.classList.contains('do-panel')) form.querySelectorAll('button').forEach(button => button.className = 'do-btn do-btn-outline do-btn-sm');
}
function secondaryClock() {
    if (!document.querySelector('.do-header')) {
        if (document.getElementById('servertime2')) return;
        const footer = document.getElementById('footer'); if (!footer) return;
        const clock = document.createElement('div'); clock.id = 'servertime2'; clock.className = 'time_display';
        clock.style.cssText = 'top:12px;border:1px solid #fff'; footer.append(clock);
        serverTime(); setInterval(serverTime, 1000);
        return;
    }
    const attach = () => {
        const serverClock = document.querySelector('.do-ftr-clock');
        if (!serverClock) return false;
        let clock = document.getElementById('servertime2');
        if (!clock) { clock = document.createElement('span'); clock.id = 'servertime2'; }
        clock.className = 'do-ftr-clock genie-clock';
        clock.removeAttribute('title');
        clock.replaceChildren(document.createTextNode('('), document.createElement('time'), document.createTextNode(')'));
        serverClock.after(clock);
        const time = clock.querySelector('time');
        const tick = () => {
            const now = new Date();
            time.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()].map(addZero).join(':');
        };
        tick(); setInterval(tick, 1000);
        return true;
    };
    if (attach()) return;
    const observer = new MutationObserver(() => { if (attach()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
function getExp() {
    return Array.from(document.querySelectorAll('[data-do-tooltip], [title]')).map(e => e.getAttribute('data-do-tooltip') || e.title || '').filter(t => /^\d+ XP$/.test(t.trim()));
}
function playerDetails() {
    const root = document.querySelector('.do-pd');
    let data, natPos;
    if (root) {
        // Ordem antiga reconstruída a partir da ordem da grade v4, não de todos os números da página.
        // Grade v4: Reflexes, One on ones, Handling, Communication, Positioning,
        // Eccentricity, Aggression, Creativity, Passing, Crossing, Long shots,
        // First touch, Influence, Speed, Shooting, Dribbling, Heading, Marking,
        // Tackling, Team work, Strength.
        const cells = Array.from(root.querySelectorAll('.do-pd-attrgrid .do-pd-av'));
        if (cells.length !== 21 || cells.some(c => !/^\d+$/.test(c.textContent.trim()))) {
            console.warn('[DO Genie] Atributos incompletos/ocultos; OPS não calculado.'); return;
        }
        const values = cells.map(c => Number(c.textContent.trim()));
        data = [0,18,8,14,6,1,17,7,15,12,2,16,10,4,19,3,9,11,20,13,5].map(i => values[i]);
        const code = root.querySelector('.do-pd-head .do-pd-pos')?.textContent.trim();
        natPos = ['GK','DL','DC','DR','ML','MC','MR','FL','FC','FR'].indexOf(code);
    } else {
        data = Array.from(document.querySelectorAll('#main-1 table tr > td')).map(c => c.textContent.trim()).filter(t => /^\d+$/.test(t)).map(Number);
        const position = getPos(); natPos = position.lastIndexOf('1');
    }
    if (natPos < 0 || data.length < 18) { console.warn('[DO Genie] Posição/atributos não reconhecidos.'); return; }
    const ops = getOPS(data), best = ops[ops.pos];
    const attrText = ' @ OPS ' + ops[natPos] + (best > ops[natPos] ? '/' + best + '*' : '');
    const exp = getExp(); const expText = genieEnabled('PLAYER_EXP') && exp.length ? ' | ' + exp.join(', ') : '';
    const name = document.querySelector('.do-pd-name, .player_name'), id = document.querySelector('.do-pd-id, .player_id_txt');
    if (!name) return;
    const baseName = name.dataset.genieBase || name.textContent.trim(); name.dataset.genieBase = baseName;
    function decorate(el, enabled) {
        if (!el) return; el.querySelector('.genie-extra')?.remove();
        if (enabled) { const extra = document.createElement('span'); extra.className = 'genie-extra'; extra.textContent = attrText + expText; el.append(extra); }
    }
    genieUI(); decorate(name, genieEnabled('PLAYER_OPS_NAME')); decorate(id, genieEnabled('PLAYER_OPS_ID'));
    if (genieEnabled('PAGE_TITLE')) document.title = baseName + attrText + expText;
}
function getPos() {
    const positions = Array(10).fill('0');
    const root = document.querySelector('.do-pd');
    if (root) {
        const i = ['GK','DL','DC','DR','ML','MC','MR','FL','FC','FR'].indexOf(root.querySelector('.do-pd-head .do-pd-pos')?.textContent.trim());
        if (i >= 0) positions[i] = '1'; return positions;
    }
    const field = document.querySelector('img[src*="positions-field"]')?.parentElement; if (!field) return positions;
    const coords = [[69,10],[20,40],[69,40],[117,40],[20,108],[69,108],[117,108],[20,185],[69,185],[117,185]];
    coords.forEach(([top,left], i) => {
        const dot = Array.from(field.querySelectorAll('div')).find(e => e.style.top === top+'px' && e.style.left === left+'px');
        const match = dot?.style.background.match(/positions-(\d+)\.png/); if (match) positions[i] = match[1];
    }); return positions;
}
function playerImage() {
    const img = document.querySelector('.do-pd-portrait') || document.querySelectorAll('.tabbed_pane img')[1];
    const pid = document.querySelector('.do-pd')?.dataset.pid || getUrlParameter('playerID');
    if (!img || !pid || document.getElementById('genie-photo')) return;
    genieUI(); const key = 'DOGenieAssistant.player.' + pid, info = genieRead(key, {img:''});
    const original = img.getAttribute('src'); const box = document.createElement('div'); box.id = 'genie-photo'; box.className = 'genie-photo';
    const input = document.createElement('input'); input.type = 'text'; input.className = 'do-input do-input-sm'; input.inputMode = 'numeric'; input.placeholder = 'ID da foto'; input.setAttribute('aria-label','ID da foto'); input.value = info.img || '';
    box.append(input); img.parentElement.after(box);
    const show = value => { img.src = value ? 'https://sortitoutsi.b-cdn.net/uploads/face/face_' + value + '.png' : original; img.style.display = ''; };
    if (/^\d+$/.test(String(info.img))) show(info.img);
    const apply = genieButton(box, 'Aplicar foto', () => {
        const value = input.value.trim(); if (value && !/^\d+$/.test(value)) { input.setCustomValidity('Use somente números.'); input.reportValidity(); return; }
        input.setCustomValidity(''); info.img = value;
        if (value) localStorage.setItem(key, JSON.stringify(info)); else localStorage.removeItem(key);
        show(value);
    }); apply.className = 'do-btn do-btn-primary do-btn-sm';
    input.addEventListener('input', () => input.setCustomValidity(''));
}
function links() {
    genieUI();
    const icons = document.querySelector('.do-header-icons'), userBar = document.querySelector('.do-user-bar, .user_bar');
    const host = icons || userBar;
    let star = document.getElementById('btnSaveLink'), render = null;
    const syncStar = () => {
        if (!star) return;
        const saved = Object.prototype.hasOwnProperty.call(genieRead('DOGenieAssistant.links', {}), location.href);
        star.textContent = saved ? '★' : '☆';
        star.title = saved ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
        star.setAttribute('aria-label', star.title); star.setAttribute('aria-pressed', String(saved));
    };
    if (host && !star) {
        star = genieButton(host, '', () => {
            const current = genieRead('DOGenieAssistant.links', {});
            if (Object.prototype.hasOwnProperty.call(current, location.href)) delete current[location.href];
            else current[location.href] = document.title;
            localStorage.setItem('DOGenieAssistant.links', JSON.stringify(current)); syncStar(); render?.(); syncNTLinks();
        });
        star.id = 'btnSaveLink'; star.className = 'genie-bookmark' + (icons ? ' do-header-icon' : '');
        if (icons && userBar) {
            const mobile = matchMedia('(max-width:560px)');
            const placeStar = () => { const target = mobile.matches ? userBar : icons; if (star.parentElement !== target) target.append(star); };
            placeStar(); mobile.addEventListener('change', placeStar);
        }
    }
    syncStar();
    if (!/^\/links(?:\/|$)/.test(location.pathname) || document.getElementById('genie-links')) return;
    const content = document.getElementById('content_main'); content?.classList.add('genie-links-page');
    content?.querySelectorAll('.window1_wrapper, .window1_header, .window1_content, .window1_content_inside, .window1_bottom').forEach(element => { element.style.width = '100%'; });
    content?.querySelectorAll('.window1_content_inside').forEach(element => { element.style.paddingBottom = '0'; });
    const panel = document.createElement('section'); panel.id = 'genie-links'; panel.className = 'do-panel';
    panel.innerHTML = '<div class="do-panel-header"><h2 class="do-panel-title">Favoritos</h2></div>' +
        '<div class="do-table-wrapper"><table id="urlsTable" class="do-table do-table-striped do-table-compact genie-links-table">' +
        '<thead><tr><th scope="col">Página</th><th scope="col">Nome</th><th scope="col">Ações</th></tr></thead><tbody></tbody></table></div>';
    (document.getElementById('pane1') || content || document.body).append(panel);
    const tbody = panel.querySelector('tbody');
    render = () => {
        tbody.replaceChildren();
        Object.entries(genieRead('DOGenieAssistant.links', {})).sort(([a],[b]) => a.localeCompare(b)).forEach(([url,title]) => {
            let parsed; try { parsed = new URL(url); } catch { return; }
            if (!['http:','https:'].includes(parsed.protocol)) return;
            const row = document.createElement('tr'); row.dataset.url = url;
            const page = document.createElement('td'), name = document.createElement('td'), actions = document.createElement('td');
            const link = document.createElement('a'); link.href = parsed.href; link.target = '_blank'; link.rel = 'noopener'; link.title = parsed.href;
            link.textContent = parsed.origin === location.origin ? parsed.pathname + parsed.search + parsed.hash : parsed.href;
            page.append(link); name.textContent = title;
            const buttons = document.createElement('div'); buttons.className = 'genie-links-actions'; actions.append(buttons);
            const edit = genieButton(buttons, 'Editar', () => {
                const value = prompt('Nome do favorito:', name.textContent); if (value === null) return;
                const current = genieRead('DOGenieAssistant.links', {}); current[url] = value;
                localStorage.setItem('DOGenieAssistant.links', JSON.stringify(current)); render(); syncStar(); syncNTLinks();
            }); edit.className = 'do-btn do-btn-outline do-btn-sm';
            const remove = genieButton(buttons, 'Remover', () => {
                const current = genieRead('DOGenieAssistant.links', {}); delete current[url];
                localStorage.setItem('DOGenieAssistant.links', JSON.stringify(current)); render(); syncStar(); syncNTLinks();
            }); remove.className = 'do-btn do-btn-danger do-btn-sm';
            row.append(page, name, actions); tbody.append(row);
        });
        if (!tbody.children.length) {
            const row = tbody.insertRow(), cell = row.insertCell(); cell.colSpan = 3; cell.className = 'genie-links-empty';
            cell.textContent = 'Nenhum favorito salvo. Use a estrela no topo da página.';
        }
    };
    render();
}
function syncNTLinks() {
    document.querySelectorAll('.genie-nav-list[data-genie-nt]').forEach(list => {
        list.querySelectorAll('.genie-nt-favorite').forEach(link => link.remove());
        Object.entries(genieRead('DOGenieAssistant.links', {})).forEach(([url, title]) => {
            if (typeof title !== 'string' || !title.includes('[NT]')) return;
            let parsed; try { parsed = new URL(url); } catch { return; }
            if (!['http:', 'https:'].includes(parsed.protocol)) return;
            const link = document.createElement('a'); link.className = 'genie-nt-favorite';
            link.href = parsed.href; link.textContent = title.replace(/\[NT\]/g, '').trim() || title;
            list.append(link);
        });
    });
}
function dropdownMenu() {
    genieUI(); const tr = getTranslation(), lang = getLanguage();
    const groups = {
        home: [['home','home_home'],['news','home_news'],['rules','home_rules'],['helpmain','home_help']],
        clubinfo: [['clubinfo','club_info'],['clubinfo/bids','club_bids'],['clubinfo/transfers','club_transfers'],['players','club_players'],['players/none/view/youth/clubid/0','club_players_youth'],['staff','club_staff'],['settings','club_settings']],
        finances: [['finances','management_finances'],['stadium','management_stadium'],['facilities','management_facilities'],['sponsors','management_sponsors'],['calendar','management_calendar']],
        tactics: [['tactics','tactics_fiest'],['tactics_youth','tactics_youth']],
        training: [['training','training_training'],['physios','training_physios'],['physio_report','training_physio_report']],
        forum: [['forum','community_forum'],['community_rules','community_rules'],['community_profile','community_profile'],['links','community_links'],['search_players','search_players'],['search_transfers','search_transfers'],['search_clubs','search_clubs'],['search_coaches','search_coaches'],['search_physios','search_physios'],['national_teams','search_national']]
    };
    document.querySelectorAll('.do-nav-item').forEach(a => {
        if (a.parentElement.classList.contains('genie-nav')) return;
        const url = new URL(a.href), key = url.pathname.split('/')[1];
        const nt = /national-team/.test(url.pathname);
        const items = nt ? [['players_nt','players_nt'],['tactics_nt','tactics_nt']] : groups[key]; if (!items) return;
        const wrapper = document.createElement('div'); wrapper.className = 'genie-nav'; a.before(wrapper); wrapper.append(a);
        const button = document.createElement('button'); button.type = 'button'; button.className = 'genie-nav-toggle';
        button.textContent = '▾'; button.title = 'Abrir atalhos'; button.setAttribute('aria-label', 'Abrir atalhos');
        button.setAttribute('aria-expanded', 'false');
        const list = document.createElement('div'); list.className = 'genie-nav-list';
        if (nt) list.dataset.genieNt = 'true';
        items.forEach(([path,label]) => { const link = document.createElement('a'); link.href = '/' + path + (path.includes('/') ? '/' : '/none/'); link.textContent = tr[label]?.[lang] || tr[label]?.en || label; list.append(link); });
        button.addEventListener('click', () => {
            const open = !wrapper.classList.contains('open');
            document.querySelectorAll('.genie-nav.open').forEach(nav => { nav.classList.remove('open'); nav.querySelector('.genie-nav-toggle')?.setAttribute('aria-expanded', 'false'); });
            wrapper.classList.toggle('open', open); button.setAttribute('aria-expanded', String(open));
        });
        wrapper.addEventListener('mouseleave', () => { wrapper.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); });
        wrapper.append(button, list);
    });
    syncNTLinks();
}

function v4SquadOPS(row) {
    const raw = row.querySelector('.do-stats-btn')?.getAttribute('data-stats');
    if (!raw) return null;
    try {
        const stats = JSON.parse(raw), values = v4StatOrder.map(key => Number(stats[key]));
        if (values.some(value => !Number.isFinite(value))) return null;
        const pos = row.querySelector('.do-col-pos')?.textContent.trim();
        if (!['GK','DL','DC','DR','ML','MC','MR','FL','FC','FR'].includes(pos)) return null;
        const scores = getOPS(values);
        return { original: scores[getPositionIndex(pos)], high: scores[scores.pos] };
    } catch (error) {
        console.warn('[DO Genie] Atributos do elenco inválidos.', error);
        return null;
    }
}
function spreadsheetSquad() {
    const table = document.querySelector('#ssTable.do-ss-table');
    if (!table) { doTable('.forumline'); return; }
    if (table.querySelector('.genie-ss-ops') || !table.tHead || !table.tBodies[0]) return;

    // A planilha v4 agrupa atributos com identificadores estáveis, independentemente do idioma.
    const groups = {
        attrs_gk: ['REF','ONE','HND','COM','PAS','PSN'],
        attrs_out: ['TCK','MRK','FTO','PAS','CRS','DRI','CRE','LSH','SHT','HEA'],
        nontrain: ['ECC','INF','AGG','TMW'],
        physical: ['SPD','STR']
    };
    const columns = {}, counts = {};
    Array.from(table.tHead.rows[0].cells).forEach(th => {
        const group = th.dataset.statGroup;
        if (!groups[group]) return;
        const key = groups[group][counts[group] || 0];
        counts[group] = (counts[group] || 0) + 1;
        if (key && columns[key] === undefined) columns[key] = th.cellIndex;
    });
    if (v4StatOrder.some(key => columns[key] === undefined)) return;

    const tbody = table.tBodies[0], originalRows = Array.from(tbody.rows);
    const scoresByRow = new Map(originalRows.map(row => {
        const pos = row.cells[1]?.textContent.trim();
        const values = v4StatOrder.map(key => {
            const cell = row.cells[columns[key]];
            const raw = cell?.getAttribute('data-v') ?? cell?.textContent.trim();
            return /^\d+$/.test(raw || '') ? Number(raw) : NaN;
        });
        if (!['GK','DL','DC','DR','ML','MC','MR','FL','FC','FR'].includes(pos) || values.some(value => !Number.isFinite(value))) return [row, null];
        const scores = getOPS(values);
        return [row, { ops: scores[getPositionIndex(pos)], high: scores[scores.pos] }];
    }));

    const heading = table.tHead.rows[0], rat = heading.cells[7];
    if (!rat) return;
    const makeHeading = label => {
        const th = document.createElement('th');
        th.className = 'do-ss-col-num do-ss-sortable genie-ss-ops';
        th.textContent = label; th.dataset.sortDir = 'desc';
        th.tabIndex = 0; th.setAttribute('role', 'button');
        return th;
    };
    const opsHeading = makeHeading('OPS'), highHeading = makeHeading('HIGH');
    rat.after(opsHeading, highHeading);
    originalRows.forEach(row => {
        const result = scoresByRow.get(row);
        [['ops', result?.ops], ['high', result?.high]].forEach(([key, value]) => {
            const cell = document.createElement('td'); cell.className = 'do-ss-col-num genie-ss-ops';
            cell.textContent = value == null ? '—' : String(value);
            cell.dataset.v = value == null ? '' : String(value);
            if (key === 'ops') row.cells[7].after(cell);
            else row.cells[8].after(cell);
        });
    });

    const originalIndex = new Map(originalRows.map((row, index) => [row, Number(row.dataset.orig ?? index)]));
    let active = null, direction = null;
    const sort = () => {
        const index = active?.cellIndex;
        Array.from(tbody.rows).sort((a, b) => {
            if (direction) {
                const left = a.cells[index].dataset.v, right = b.cells[index].dataset.v;
                if ((left === '') !== (right === '')) return left === '' ? 1 : -1;
                if (left !== '' && Number(left) !== Number(right)) {
                    return (Number(left) - Number(right)) * (direction === 'desc' ? -1 : 1);
                }
            }
            return originalIndex.get(a) - originalIndex.get(b);
        }).forEach(row => tbody.append(row));
    };
    const reorder = th => {
        const next = active !== th ? 'desc' : direction === 'desc' ? 'asc' : direction === 'asc' ? null : 'desc';
        // Limpa também o estado interno do ordenador nativo antes de usar uma coluna nova.
        const native = table.tHead.querySelector('th:not(.genie-ss-ops).do-sort-asc, th:not(.genie-ss-ops).do-sort-desc');
        if (native) {
            if (native.classList.contains('do-sort-' + native.dataset.sortDir)) native.click();
            native.click();
        }
        if (active) active.classList.remove('do-sort-asc', 'do-sort-desc');
        active = next ? th : null; direction = next;
        if (active) active.classList.add('do-sort-' + direction);
        sort();
    };
    [opsHeading, highHeading].forEach(th => {
        th.addEventListener('click', () => reorder(th));
        th.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reorder(th); }
        });
    });
    table.tHead.addEventListener('click', event => {
        if (event.target.closest('th')?.classList.contains('genie-ss-ops')) return;
        if (active) active.classList.remove('do-sort-asc', 'do-sort-desc');
        active = null; direction = null;
    });
}
function v4SquadDetails() {
    document.querySelectorAll('.do-players-table').forEach(table => {
        const header = table.querySelector('thead tr');
        if (!header || header.querySelector('.genie-ops')) return;
        const headings = [['OPS', 'Soma das habilidades da posição preferida']];
        if (genieEnabled('SQUAD_HIGH')) headings.push(['HIGH', 'Melhor soma entre posições']);
        const tbody = table.querySelector('tbody');
        const sort = (key, ascending) => {
            Array.from(tbody.rows).sort((a, b) => {
                const left = Number(a.dataset[key]), right = Number(b.dataset[key]);
                return (ascending ? 1 : -1) * ((Number.isFinite(left) ? left : -1) - (Number.isFinite(right) ? right : -1));
            }).forEach(row => tbody.append(row));
        };
        headings.forEach(([text, title], index) => {
            const th = document.createElement('th'); th.className = 'genie-ops';
            th.textContent = text; th.title = title + ' (clique para ordenar)'; th.tabIndex = 0; th.setAttribute('role', 'button');
            let ascending = false;
            const reorder = () => { sort(index ? 'genieHigh' : 'genieOps', ascending); ascending = !ascending; };
            th.addEventListener('click', reorder);
            th.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reorder(); } });
            header.append(th);
        });
        table.querySelectorAll('tbody tr').forEach(row => {
            const result = v4SquadOPS(row);
            if (result) { row.dataset.genieOps = String(result.original); row.dataset.genieHigh = String(result.high); }
            (genieEnabled('SQUAD_HIGH') ? [result?.original, result?.high] : [result?.original]).forEach(value => {
                const td = document.createElement('td'); td.className = 'genie-ops';
                td.textContent = value == null ? '—' : String(value); row.append(td);
            });
        });
        if (tbody) sort(genieEnabled('SQUAD_HIGH') ? 'genieHigh' : 'genieOps', false);
    });
}
function v4SquadFilters() {
    if (document.getElementById('genie-squad-filters')) return;
    const content = document.querySelector('.do-players-content');
    if (!content || !content.querySelector('.do-players-table')) return;
    genieUI();
    const form = document.createElement('form'); form.id = 'genie-squad-filters'; form.className = 'genie-filters do-panel';
    const fields = [['minAge','Idade mínima'],['maxAge','Idade máxima'],['minRat','RAT mínimo'],['maxRat','RAT máximo'],['minOPS','OPS mínimo'],['maxOPS','OPS máximo']];
    fields.forEach(([id, text]) => {
        const label = document.createElement('label'), input = document.createElement('input');
        input.id = id; input.type = 'number'; input.min = '0'; input.className = 'do-input do-input-sm'; input.setAttribute('aria-label', text);
        label.append(document.createTextNode(text), input); form.append(label);
    });
    const clear = genieButton(form, 'Limpar filtros', () => form.reset());
    clear.className = 'do-btn do-btn-outline do-btn-sm';
    clear.addEventListener('click', () => form.dispatchEvent(new Event('input')));
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', () => {
        const number = id => { const value = form.querySelector('#' + id).value; return value === '' ? null : Number(value); };
        const [minAge,maxAge,minRat,maxRat,minOPS,maxOPS] = fields.map(([id]) => number(id));
        document.querySelectorAll('.do-players-table tbody tr').forEach(row => {
            const age = Number(row.querySelector('.do-col-age')?.textContent.trim());
            const rat = Number(row.querySelector('.do-col-rat')?.textContent.trim());
            const ops = Number(row.dataset.genieOps ?? v4SquadOPS(row)?.original);
            row.style.display = (
                (minAge === null || age >= minAge) && (maxAge === null || age <= maxAge) &&
                (minRat === null || rat >= minRat) && (maxRat === null || rat <= maxRat) &&
                (minOPS === null || ops >= minOPS) && (maxOPS === null || ops <= maxOPS)
            ) ? '' : 'none';
        });
    });
    content.prepend(form);
}
function v4HideTrainingReport() {
    if (document.getElementById('genie-training-hide')) return;
    const rows = document.querySelectorAll('.do-tr-prow');
    if (!rows.length) return;
    const host = document.querySelector('.do-tr-players-panel .do-panel-body, .do-tr-quality') || rows[0].closest('table');
    if (!host) return;
    genieUI();
    const label = document.createElement('label'), input = document.createElement('input');
    label.id = 'genie-training-hide'; label.className = 'genie-training-controls';
    input.type = 'checkbox'; input.checked = true;
    label.append(input, document.createTextNode('Ocultar jogadores fora do relatório de treino'));
    host.before(label);
    const update = () => rows.forEach(row => {
        row.style.display = input.checked && row.querySelector('.do-tr-listtog')?.dataset.excl === '1' ? 'none' : '';
    });
    input.addEventListener('change', update);
    rows.forEach(row => {
        const button = row.querySelector('.do-tr-listtog');
        if (button) new MutationObserver(update).observe(button, { attributes: true, attributeFilter: ['data-excl'] });
    });
    update();
}
function v4CoachEffectiveness() {
    if (document.getElementById('genie-coach-effectiveness')) return;
    const quality = document.querySelector('.do-tr-quality');
    const coaches = document.querySelectorAll('.do-tr-coach[data-cid]').length;
    if (!quality || !coaches) return;
    genieUI();
    const box = document.createElement('div'); box.id = 'genie-coach-effectiveness'; box.className = 'genie-training-controls';
    const result = document.createElement('span'); result.setAttribute('role', 'status'); result.textContent = 'Efetividade dos técnicos: —';
    const button = genieButton(box, 'Calcular', async () => {
        const urls = [...new Set(Array.from(document.querySelectorAll('.do-tr-prow .do-tr-c-name a[href*="/players/"]'), a => a.href))];
        button.disabled = true; result.textContent = 'Consultando contratos…';
        let contracted = 0, failures = 0;
        for (let i = 0; i < urls.length; i += 5) {
            const batch = await Promise.all(urls.slice(i, i + 5).map(async url => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(String(response.status));
                    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
                    const contract = Array.from(doc.querySelectorAll('.do-pd-cl')).find(el => el.textContent.trim().toLowerCase() === 'contract')?.nextElementSibling?.textContent.trim();
                    if (!contract) throw new Error('Contrato não encontrado');
                    return contract !== '/' && !/^no contract$/i.test(contract);
                } catch (error) { console.warn('[DO Genie] Contrato indisponível:', url, error); return null; }
            }));
            contracted += batch.filter(value => value === true).length;
            failures += batch.filter(value => value === null).length;
        }
        if (failures) result.textContent = 'Efetividade indisponível: ' + failures + ' contrato(s) não lido(s).';
        else {
            const excess = Math.max(0, contracted - coaches * 7);
            const percentages = [100,99,98,96,92,88,82,76,68,60,50,40,28,16];
            result.textContent = 'Jogadores contratados: ' + contracted + ' · Efetividade dos técnicos: ' + (excess > 13 ? 10 : percentages[excess]) + '%';
        }
        button.disabled = false;
    });
    box.prepend(result); quality.after(box);
}
function v4MatchSound() {
    const gameId = getUrlParameter('gameid');
    if (!gameId) return;
    const key = 'DOGenieAssistant.match.' + gameId;
    const match = genieRead(key, {});
    const rows = Array.from(document.querySelectorAll('#doMvCommentary table tr')).slice(0, 5);
    const home = document.querySelector('.do-mv-team.home .do-mv-team-name')?.textContent.trim();
    function play(event, time, soundId) {
        if (!/^\d+$/.test(String(soundId)) || Number(formatTime(match[event])) >= Number(formatTime(time))) return;
        match[event] = time; localStorage.setItem(key, JSON.stringify(match));
        const iframe = document.createElement('iframe');
        iframe.width = '0'; iframe.height = '0'; iframe.allow = 'autoplay';
        iframe.src = 'https://w.soundcloud.com/player/?url=' +
            encodeURIComponent('https://api.soundcloud.com/tracks/' + soundId) + '&auto_play=true';
        document.querySelector('#doMvCommentary').append(iframe);
        setTimeout(() => iframe.remove(), 30000);
    }
    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;
        const time = cells[1].textContent.trim();
        const icon = cells[0].querySelector('img')?.src || '';
        if (soundConfig.GOAL_SOUND && icon.includes('icon-goal')) {
            const club = cells[2].querySelector('a[href*="/clubinfo/"]')?.textContent.trim();
            play('LAST_GOAL', time, club === home ? soundConfig.HOME_GOAL_ID : soundConfig.AWAY_GOAL_ID);
            break;
        }
        if (soundConfig.OFFSIDE_SOUND && icon.includes('icon-offside')) {
            play('LAST_OFFSIDE', time, soundConfig.OFFSIDE_ID);
            break;
        }
    }
    const latest = rows[0]?.querySelectorAll('td');
    if (soundConfig.GAME_END_SOUND && latest?.[2]?.textContent.trim().startsWith('Game ends')) {
        play('GAME_ENDS', latest[1].textContent.trim(), soundConfig.GAME_END_ID);
    }
}
function v4MatchNames() {
    const commentary = document.querySelector('#doMvCommentary');
    if (!commentary) return;
    const names = new Map();
    commentary.querySelectorAll('a[href*="/players/"]').forEach(link => {
        const id = link.href.match(/playerID\/(\d+)/)?.[1], name = link.textContent.trim();
        if (id && name.length > (names.get(id)?.length || 0)) names.set(id, name);
    });
    const replace = () => {
        document.querySelectorAll('.do-mv-pname, .do-mv-evpl, #doMvCommentary a[href*="/players/"]').forEach(link => {
            const id = link.href.match(/playerID\/(\d+)/)?.[1], name = names.get(id);
            if (name && link.textContent.trim().length < name.length) link.textContent = name;
        });
    };
    replace();
    const header = commentary.parentElement?.querySelector('.do-panel-header');
    if (header && !header.querySelector('#genie-match-names')) {
        const button = genieButton(header, 'Atualizar nomes', replace);
        button.id = 'genie-match-names'; button.className = 'do-btn do-btn-sm';
    }
}
function v4AutoScore() {
    document.querySelectorAll('.do-fixtures-panel').forEach(panel => {
        const links = Array.from(panel.querySelectorAll('.do-fixture-vs[href*="/game/"]'));
        const header = panel.querySelector('.do-fixtures-panel-header');
        if (!links.length || !header || header.querySelector('.genie-score-button')) return;
        const button = genieButton(header, 'Atualizar placares', async () => {
            button.disabled = true; button.textContent = 'Monitorando placares';
            const refresh = async () => {
                const previous = links.map(link => link.dataset.genieScore || '');
                const results = await Promise.all(links.map(link => fetchScore(link.href)));
                results.forEach((score, i) => {
                    if (!score) return;
                    const link = links[i];
                    if (previous[i] && previous[i] !== score && /^\d+$/.test(String(soundConfig.UPDATE_GOAL_ID))) {
                        const iframe = document.createElement('iframe');
                        iframe.width = '0'; iframe.height = '0'; iframe.allow = 'autoplay';
                        iframe.src = 'https://w.soundcloud.com/player/?url=' +
                            encodeURIComponent('https://api.soundcloud.com/tracks/' + soundConfig.UPDATE_GOAL_ID) + '&auto_play=true';
                        panel.append(iframe); setTimeout(() => iframe.remove(), 30000);
                    }
                    link.textContent = score; link.dataset.genieScore = score;
                    link.classList.replace('do-fixture-vs', 'do-fixture-score');
                });
                if (panel.isConnected) setTimeout(refresh, 90000);
            };
            await refresh();
        });
        button.className = 'do-btn do-btn-sm genie-score-button';
    });
}
