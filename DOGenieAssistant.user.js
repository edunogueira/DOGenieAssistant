// ==UserScript==
// @name         DO Genie Assistant
// @version      35.0
// @namespace    https://github.com/gabrielbitencourt/DOGenieAssistant/
// @description  dugout-online genie assistant
// @author       Eduardo Nogueira de Oliveira
// @icon         https://www.google.com/s2/favicons?domain=dugout-online.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js
// @include      http*dugout-online.com/*
// @include      https://www.dugout-online.com/*
// ==/UserScript==

/* eslint-disable strict */
/* eslint-disable no-restricted-properties */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
/* eslint-disable jsdoc/require-param-type */
/* eslint-disable jsdoc/require-param-description */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
/* eslint-disable func-style */

/**
 *
 * @param storageConfigs
 */
function getStorage(storageConfigs) {
    const defaultConfigs = {
        SECONDARY_CLOCK: 'checked',
        DROPDDOWN_MENU: 'checked',
        PAGE_TITLE: 'checked',
        READ_RESUME: 'checked',
        PLAYER_OPS_NAME: 'checked',
        PLAYER_OPS_ID: 'checked',
        PLAYER_EXP: 'checked',
        SQUAD_DETAILS: 'checked',
        SQUAD_FILTERS: 'checked',
        SQUAD_HIGH: 'checked',
        LOAD_TACTICS: 'checked',
        TACTICS_DETAILS: 'checked',
        COACHES_WAGE: 'checked',
        SCOUT_BUTTON: 'checked',
        SPREADSHEET_SQUAD: 'checked',
        BID_BUTTON: 'checked',
        TEAM_LINK: 'checked',
        GET_SPONSORS: 'checked',
        PLAYER_IMAGE: 'checked',
        LINKS: 'checked',
        STORED_FILTERS: 'checked',
        GOALS_DIFFERENCE: 'checked'
    };

    return (storageConfigs == null || storageConfigs == '[]') ? defaultConfigs : JSON.parse(storageConfigs);
}

/**
 *
 * @param storageConfigs
 */
function getSoundStorage(storageConfigs) {
    const defaultSoundConfig = {
        MATCH_SOUND: 'checked',
        GOAL_SOUND: 'checked',
        HOME_GOAL_ID: '1579437467',
        AWAY_GOAL_ID: '1636248327',
        OFFSIDE_SOUND: 'checked',
        OFFSIDE_ID: '1636263519',
        GAME_END_SOUND: 'checked',
        GAME_END_ID: '1636248255'
    };

    return storageConfigs ? JSON.parse(storageConfigs) : defaultSoundConfig;
}

const page = document.URL;
const configs = getStorage(localStorage.getItem('DOGenieAssistant.configs')) || {};

/**
 *
 * @param i
 */
function addZero(i) {
    return i < 10 ? `0${i}` : i;
}

/**
 *
 */
function serverTime() {
    const d = new Date();
    const time = `${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}`;
    $('#servertime2').text(time);
}

/**
 *
 * @param css
 */
function applyStyle(css) {
    const head = document.head || document.getElementsByTagName('head')[0];

    if (head) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }
}

/**
 *
 */
function getExp() {
    return $('div[title]')
        .map(function() {
            const titleString = $(this).attr('title');
            return /^\d+ XP$/u.test(titleString) ? titleString : null;
        })
        .get();
}

/**
 *
 */
function getPos() {
    const posArray = Array.from({ length: 10 }, () => '0');

    const mainDiv = document.querySelector('img[src*="positions-field"]').parentNode;

    const positions = [
        { top: '69px', left: '10px', index: 0 }, // GK
        { top: '20px', left: '40px', index: 1 }, // DL
        { top: '69px', left: '40px', index: 2 }, // DC
        { top: '117px', left: '40px', index: 3 }, // DR
        { top: '20px', left: '108px', index: 4 }, // ML
        { top: '69px', left: '108px', index: 5 }, // MC
        { top: '117px', left: '108px', index: 6 }, // MR
        { top: '20px', left: '185px', index: 7 }, // FL
        { top: '69px', left: '185px', index: 8 }, // FC
        { top: '117px', left: '185px', index: 9 } // FR
    ];

    positions.forEach((pos) => {
        const posDiv = Array.from(mainDiv.querySelectorAll('div[style*="background"]')).find((div) => div.style.top === pos.top && div.style.left === pos.left);

        if (posDiv) {
            const img = posDiv.style.background;
            const num = img.substring(img.indexOf('positions-') + 'positions-'.length, img.indexOf('.png'));
            posArray[pos.index] = num;
        }
    });

    return posArray;
}

/**
 *
 * @param data
 */
function getOPS(data) {
    const ops = [];
    const positions = [
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

    ops.pos = 0;

    for (let i = 0; i < positions.length; ++i) {
        ops[i] = positions[i].reduce((sum, index) => sum + data[index], 0);
        if (isNaN(ops[i]))
            ops[i] = 0;


        if (ops[i] >= ops[ops.pos])
            ops.pos = i;

    }

    return ops;
}

/**
 *
 * @param selector
 */
function doTable(selector) {
    $(`${selector} tr:first td`).wrapInner('<div />').find('div').unwrap().wrap('<th/>');
    const header = $(`${selector} .table_top_row:first`).clone();
    $(`${selector} .table_top_row:first`).remove();
    $(`${selector} tbody:first`).before('<thead></thead>');
    $(`${selector} thead:first`).append(header);
    let order = $(`${selector} .table_top_row th`).size() - 1;
    if ((configs.SQUAD_HIGH) || (typeof configs.SQUAD_HIGH === 'undefined'))
        order = $(`${selector} .table_top_row th`).size() - 2;


    if ((configs.SQUAD_FILTERS) || (typeof configs.SQUAD_FILTERS === 'undefined')) {
        $(selector).dataTable({
            searching: true,
            bPaginate: false,
            bLengthChange: false,
            bFilter: false,
            bInfo: false,
            bAutoWidth: false,
            order: [
                [order, 'desc']
            ]
        });
    }
    else {
        $(selector).dataTable({
            searching: false,
            bPaginate: false,
            bLengthChange: false,
            bFilter: false,
            bInfo: false,
            bAutoWidth: false,
            order: [
                [order, 'desc']
            ]
        });
    }
}


// #region Features

/**
 *
 */
function playerDetails() {
    let attrText = '';
    const data = [];

    $('#main-1 table tr').each(function() {
        $(this).children('td').each(function() {
            if ($.isNumeric($(this).text()))
                data.push(parseInt($(this).text(), 10));
        });
    });
    const ops = getOPS(data);
    const position = getPos();
    let natPos = 0;

    for (let i = 0; i < position.length; ++i) {
        if (position[i] == 1)
            natPos = i;
    }

    if (ops.pos !== natPos) attrText = ` @ OPS ${ops[natPos]}/${ops[ops.pos]}*`;
    else attrText = ` @ OPS ${ops[natPos]}`;


    const exp = getExp();
    const playerName = $('.player_name').text();

    if (configs.PLAYER_OPS_ID !== '')
        $('.player_id_txt').text($('.player_id_txt').text() + attrText);


    if (configs.PLAYER_OPS_NAME !== '') {
        $('.player_name').text($('.player_name').text() + attrText);
        $('.player_id_txt').css({
            position: 'absolute',
            right: '30px'
        });
    }
    const expText = ` | ${exp}`;
    if (configs.PLAYER_EXP !== '') {
        if (configs.PLAYER_OPS_NAME !== '')
            $('.player_name').text($('.player_name').text() + expText);


        if (configs.PLAYER_OPS_ID !== '')
            $('.player_id_txt').text($('.player_id_txt').text() + expText);

    }

    $(document).prop('title', playerName + attrText + expText);
}

/**
 *
 * @param position
 */
function getPositionIndex(position) {
    switch (position) {
        case 'GK': return 0;
        case 'DL': return 1;
        case 'DC': return 2;
        case 'DR': return 3;
        case 'ML': return 4;
        case 'MC': return 5;
        case 'MR': return 6;
        case 'FL': return 7;
        case 'FC': return 8;
        case 'FR': return 9;
        default: return 0;
    }
}

/**
 *
 */
function squadDetails() {
    $('.forumline .table_top_row').each(function() {
        const headerRow = $(this).last();
        headerRow.append('<td align="center" width="20" title="Original Position Skills" class="tableHeader">OPS</td>');
        if (configs.SQUAD_HIGH !== '')
            headerRow.append('<td align="center" width="20" title="Best Original Position Skills" class="tableHeader">HIGH</td>');

    });

    $('.forumline [class*=matches_row]').each(function() {
        const data = [];
        let count = 0;
        $(this).find('.tableHeader').remove();

        $(this).find('tr').each(function() {
            $(this).children('td').each(function() {
                if ($.isNumeric($(this).text()))
                    data.push(parseInt($(this).text(), 10));
                else
                    count++;

            });
        });

        if (data.length > 0) {
            const position = $(this).find(' [class*=_icon]').text();
            const ops = getOPS(data);
            const natPos = getPositionIndex(position);

            $(this).last().append(`<td align="center"><span class="tableText">${ops[natPos]}</span></td>`);

            if (configs.SQUAD_HIGH !== '') {
                const highOps = ops[ops.pos];
                const cellText = highOps > ops[natPos] ? `<strong>${highOps}</strong>` : highOps;
                $(this).last().append(`<td align="center"><span class="tableText">${cellText}</span></td>`);
            }
        }
        else if (count > 1) {
            $(this).last().append('<td align="center"><span class="tableText">0</span></td>');
            if (configs.SQUAD_HIGH !== '')
                $(this).last().append('<td align="center"><span class="tableText">0</span></td>');

        }
    });
    const tables = document.querySelectorAll('[class=forumline]');
    tables[0].classList.add('gks');
    tables[1].classList.add('dcs');
    tables[2].classList.add('mcs');
    tables[3].classList.add('pls');
    doTable('.forumline.gks');
    doTable('.forumline.dcs');
    doTable('.forumline.mcs');
    doTable('.forumline.pls');
}

/**
 *
 */
function squadFilters() {
    $('#top_positions').before('<table class="inputs"><tbody><tr><td>Min Age</td><td><input type="search" id="minAge" name="minAge"></td><td>Min Rat</td><td><input type="search" id="minRat" name="minRat"></td><td>Min OPS</td><td><input type="search" id="minOPS" name="minOPS"></td><td><button id="clearButton" onclick="">Clear Fields</button></td></tr><tr><td>Max Age</td><td><input type="search" id="maxAge" name="maxAge"></td><td>Max Rat</td><td><input type="search" id="maxRat" name="maxRat"></td><td>Max OPS</td><td><input type="search" id="maxOPS" name="maxOPS"></td></tr></tbody></table>');

    $('#clearButton').on('click', () => {
        $('input[type="search"]').val('').change();
        // eslint-disable-next-line new-cap
        $('.forumline').DataTable().search('').draw();
    });

    const inputIds = ['minAge', 'maxAge', 'minRat', 'maxRat', 'minOPS', 'maxOPS'];
    const inputs = inputIds.map((id) => document.querySelector(`#${id}`));
    const i = ($('.top_positions').length) ? 1 : 0;
    // eslint-disable-next-line no-undef
    DataTable.ext.search.push((_settings, data) => {
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
        )
            return true;


        return false;
    });

    inputs.forEach((input) => {
        input.addEventListener('input', () => {
            // eslint-disable-next-line new-cap
            $('.forumline').DataTable().draw();
        });
    });
}

/**
 *
 */
function tacticsDetails() {
    $(document).ready(() => {
        $('#agression_id').css('width', '99px');
    });
    const newAgg = $('<input>').attr({
        type: 'text',
        id: 'newAgg',
        placeholder: 'Agg',
        onmousedown: '$(\'#agression_id\').val($(this).val());showAgression()',
        onchange: '$(\'#agression_id\').val($(this).val());showAgression()',
        oninput: '$(\'#agression_id\').val($(this).val());showAgression()',
        onkeypress: '$(\'#agression_id\').val($(this).val());showAgression()',
        onmouseup: '$(\'#agression_id\').val($(this).val());showAgression()',
        onclick: '$(\'#agression_id\').val($(this).val());showAgression()'
    }).css('width', '23px');

    newAgg.val($('#agression_id').val());
    $('#agression_id').on('input', function() {
        $('#newAgg').val($(this).val());
    });

    $('#agression_id').before(newAgg);

    $('td').css('color', 'unset');

    const players = $('#capitan_sel > option').map(function() {
        return this.value;
    }).get();

    const subs = $('#sub_with > option').map(function() {
        return this.value;
    }).get();

    $('.player').each(function() {
        const $parentRow = $(this).closest('tr');
        const playerId = $(this).attr('rel').split('|')[0];
        const isCaptain = players.includes(playerId);
        const isSub = subs.includes(playerId);

        if (isCaptain) {
            $parentRow.css({
                'text-decoration': 'underline',
                'font-weight': 'bold'
            });
        }

        if (isSub) {
            $parentRow.css({
                'font-weight': 'bold',
                color: 'blue'
            });
            $(this).css('color', 'blue');
        }

        const data = [];
        let i = 0;
        $(`#${playerId} table tr`).each(function() {
            $(this).children('td').each(function() {
                if ($.isNumeric($(this).text())) {
                    data.push(parseInt($(this).text(), 10));
                    i++;
                }
                else if (i == 21) {
                    $(this).append('OPS');
                    $(this).css('font-size', '12px');
                    i++;
                }
                else if (i == 22) {
                    $(this).append('0');

                    $(this).css({
                        'font-size': '12px',
                        'font-weight': 'bold'
                    });
                    $(this).addClass('ops');
                    i++;
                }
            });
        });

        if (data.length > 0) {
            const array = $(this).parent().next().map(function() {
                return $.trim($(this).text());
            }).get();
            const position = array[0];
            let ops = 0;

            if (position === 'GK')
                ops = (data[0] + data[5] + data[10] + data[15] + data[13]);

            else if (position === 'DC')
                ops = (data[6] + data[11] + data[1] + data[15] + data[13]);

            else if (position === 'DL' || position === 'DR')
                ops = (data[16] + data[6] + data[1] + data[15] + data[13]);

            else if (position === 'ML' || position === 'MR')
                ops = (data[16] + data[17] + data[7] + data[2] + data[13]);

            else if (position === 'MC')
                ops = (data[12] + data[17] + data[7] + data[2] + data[13]);

            else if (position === 'FL' || position === 'FR')
                ops = (data[3] + data[8] + data[17] + data[16] + data[13]);

            else if (position === 'FC')
                ops = (data[3] + data[8] + data[17] + data[11] + data[13]);


            $(`#${playerId} .ops`).text(ops);
        }
    });
}

/**
 *
 */
function secondaryClock() {
    $('#footer').append('<div class="time_display" id="servertime2" style="top: 12px;border:1px solid #fff"></div>');
    setInterval(serverTime, 1000);
}

/**
 *
 */
function getLanguage() {
    let settingsTitle = 'en';
    if (document.querySelector('.settings_button'))
        settingsTitle = document.querySelector('.settings_button').title;

    const languages = {
        Postavke: 'bh',
        Settings: 'en',
        Configuraciones: 'es',
        Impostazioni: 'it',
        Instellingen: 'nl',
        Configurações: 'br',
        Setări: 'ro',
        Nastavitve: 'sl',
        Ayarlar: 'tr',
        설정: 'ko'
    };
    return languages[settingsTitle];
}

/**
 *
 */
function getTranslation() {
    return {
        bid: {
            en: 'Bid',
            br: 'Oferta',
            es: 'Oferta',
            it: 'Offerta',
            nl: 'Bod',
            ro: 'Ofertă',
            sl: 'Ponudba',
            tr: 'Teklif',
            ko: '입찰',
            bh: 'Ponuda'
        },
        home_home: {
            en: 'Home',
            br: 'Início',
            es: 'Inicio',
            it: 'Home',
            nl: 'Thuis',
            ro: 'Acasă',
            sl: 'Domov',
            tr: 'Anasayfa',
            ko: '홈',
            bh: 'Početna'
        },
        home_news: {
            en: 'News',
            br: 'Notícias',
            es: 'Noticias',
            it: 'Notizie',
            nl: 'Nieuws',
            ro: 'Știri',
            sl: 'Novice',
            tr: 'Haberler',
            ko: '뉴스',
            bh: 'Vijesti'
        },
        home_rules: {
            en: 'Rules',
            br: 'Regras',
            es: 'Reglas',
            it: 'Regole',
            nl: 'Regels',
            ro: 'Reguli',
            sl: 'Pravila',
            tr: 'Kurallar',
            ko: '규칙',
            bh: 'Pravila'
        },
        home_help: {
            en: 'Help',
            br: 'Ajuda',
            es: 'Ayuda',
            it: 'Aiuto',
            nl: 'Hulp',
            ro: 'Ajutor',
            sl: 'Pomoč',
            tr: 'Yardım',
            ko: '도움말',
            bh: 'Pomoć'
        },
        club_info: {
            en: 'Info',
            br: 'Informações',
            es: 'Información',
            it: 'Informazioni',
            nl: 'Info',
            ro: 'Informații',
            sl: 'Informacije',
            tr: 'Bilgi',
            ko: '정보',
            bh: 'Informacije'
        },
        club_bids: {
            en: 'Bids',
            br: 'Ofertas',
            es: 'Ofertas',
            it: 'Offerte',
            nl: 'Biedingen',
            ro: 'Oferte',
            sl: 'Ponudbe',
            tr: 'Teklifler',
            ko: '입찰',
            bh: 'Ponude'
        },
        club_transfers: {
            en: 'Transfers',
            br: 'Transferências',
            es: 'Transferencias',
            it: 'Trasferimenti',
            nl: 'Transfers',
            ro: 'Transferuri',
            sl: 'Prenosi',
            tr: 'Transferler',
            ko: '이적',
            bh: 'Transferi'
        },
        club_players: {
            en: 'Players',
            br: 'Jogadores',
            es: 'Jugadores',
            it: 'Giocatori',
            nl: 'Spelers',
            ro: 'Jucători',
            sl: 'Igralci',
            tr: 'Oyuncular',
            ko: '선수들',
            bh: 'Igrači'
        },
        club_players_youth: {
            en: 'Players (Youth)',
            br: 'Jogadores (Juvenil)',
            es: 'Jugadores (Juvenil)',
            it: 'Giocatori (Giovani)',
            nl: 'Jeugdspelers',
            ro: 'Jucători (Tineret)',
            sl: 'Igralci (Mladina)',
            tr: 'Oyuncular (Genç)',
            ko: '선수들 (청소년)',
            bh: 'Igrači (mladi)'
        },
        scout_report: {
            en: 'Scout Report',
            br: 'Relatório do Espião',
            es: 'Informe del Explorador',
            it: 'Rapporto dell\'Esperto',
            nl: 'Scout Rapport',
            ro: 'Raport de Spionaj',
            sl: 'Poročilo Izvida',
            tr: 'Casus Raporu',
            ko: '스카우트 보고서',
            bh: 'Izvještaj skauta'
        },
        club_staff: {
            en: 'Staff',
            br: 'Comissão Técnica',
            es: 'Personal',
            it: 'Personale',
            nl: 'Personeel',
            ro: 'Staff',
            sl: 'Osebje',
            tr: 'Personel',
            ko: '스태프',
            bh: 'Osoblje'
        },
        club_settings: {
            en: 'Settings',
            br: 'Configurações',
            es: 'Ajustes',
            it: 'Impostazioni',
            nl: 'Instellingen',
            ro: 'Setări',
            sl: 'Nastavitve',
            tr: 'Ayarlar',
            ko: '설정',
            bh: 'Postavke'
        },
        players_nt: {
            en: 'Players',
            br: 'Jogadores',
            es: 'Jugadores',
            it: 'Giocatori',
            nl: 'Spelers',
            ro: 'Jucători',
            sl: 'Igralci',
            tr: 'Oyuncular',
            ko: '선수들',
            bh: 'Igrači'
        },
        tactics_nt: {
            en: 'Tactics',
            br: 'Táticas',
            es: 'Tácticas',
            it: 'Tattiche',
            nl: 'Tactieken',
            ro: 'Tactică',
            sl: 'Taktika',
            tr: 'Taktikler',
            ko: '전술',
            bh: 'Taktike'
        },
        management_finances: {
            en: 'Finances',
            br: 'Finanças',
            es: 'Finanzas',
            it: 'Finanze',
            nl: 'Financiën',
            ro: 'Finanțe',
            sl: 'Finance',
            tr: 'Finans',
            ko: '재무',
            bh: 'Finansije'
        },
        management_stadium: {
            en: 'Stadium',
            br: 'Estádio',
            es: 'Estadio',
            it: 'Stadio',
            nl: 'Stadion',
            ro: 'Stadion',
            sl: 'Stadion',
            tr: 'Stadyum',
            ko: '경기장',
            bh: 'Stadion'
        },
        management_facilities: {
            en: 'Facilities',
            br: 'Instalações',
            es: 'Instalaciones',
            it: 'Strutture',
            nl: 'Faciliteiten',
            ro: 'Facilități',
            sl: 'Objekti',
            tr: 'Tesisler',
            ko: '시설',
            bh: 'Objekti'
        },
        management_sponsors: {
            en: 'Sponsors',
            br: 'Patrocinadores',
            es: 'Patrocinadores',
            it: 'Sponsor',
            nl: 'Sponsors',
            ro: 'Sponsori',
            sl: 'Sponzorji',
            tr: 'Sponsorlar',
            ko: '후원사',
            bh: 'Pokrovitelji'
        },
        management_calendar: {
            en: 'Calendar',
            br: 'Calendário',
            es: 'Calendario',
            it: 'Calendario',
            nl: 'Kalender',
            ro: 'Calendar',
            sl: 'Koledar',
            tr: 'Takvim',
            ko: '일정',
            bh: 'Kalendar'
        },
        tactics_fiest: {
            en: 'Tactics',
            br: 'Táticas',
            es: 'Tácticas',
            it: 'Tattiche',
            nl: 'Tactiek',
            ro: 'Tactici',
            sl: 'Taktike',
            tr: 'Taktikler',
            ko: '전술',
            bh: 'Taktike'
        },
        tactics_youth: {
            en: 'Tactics (youth)',
            br: 'Táticas (juvenil)',
            es: 'Tácticas (juveniles)',
            it: 'Tattiche (giovanili)',
            nl: 'Tactiek (jeugd)',
            ro: 'Tactici (tineret)',
            sl: 'Taktike (mladina)',
            tr: '유소년 택틱',
            ko: '유소년 택틱',
            bh: 'Taktike (mladi)'
        },
        training_training: {
            en: 'Training',
            br: 'Treinamento',
            es: 'Entrenamiento',
            it: 'Allenamento',
            nl: 'Training',
            ro: 'Antrenament',
            sl: 'Trening',
            tr: 'Eğitim',
            ko: '훈련',
            bh: 'Treniranje'
        },
        training_physios: {
            en: 'Physios',
            br: 'Fisioterapeutas',
            es: 'Fisioterapeutas',
            it: 'Fisioterapisti',
            nl: 'Fysiotherapeuten',
            ro: 'Fizioterapeuți',
            sl: 'Fizioterapevti',
            tr: 'Fizyoterapistler',
            ko: '물리 치료사',
            bh: 'Fizioterapeuti'
        },
        training_physio_report: {
            en: 'Physio Report',
            br: 'Relatório de lesões',
            es: 'Informe del fisioterapeuta',
            it: 'Rapporto fisioterapico',
            nl: 'Fysiotherapieverslag',
            ro: 'Raport fizioterapeutic',
            sl: 'Fizioterapevtsko poročilo',
            tr: '물리치료사 보고서',
            ko: '물리치료사 보고서',
            bh: 'Izvještaj fizioterapeuta'
        },
        search_players: {
            en: 'Players',
            br: 'Jogadores',
            es: 'Jugadores',
            it: 'Giocatori',
            nl: 'Spelers',
            ro: 'Jucători',
            sl: 'Igralci',
            tr: '선수들',
            ko: '선수들',
            bh: 'Igrači'
        },
        search_clubs: {
            en: 'Clubs',
            br: 'Clubes',
            es: 'Clubes',
            it: 'Club',
            nl: 'Clubs',
            ro: 'Cluburi',
            sl: 'Klubi',
            tr: 'Kulüpler',
            ko: '클럽',
            bh: 'Klubovi'
        },
        search_national: {
            en: 'National',
            br: 'Seleções',
            es: 'Selección Nacional',
            it: 'Nazionale',
            nl: 'Nationale Teams',
            ro: 'Națională',
            sl: 'Nacionalna',
            tr: 'Milli',
            ko: '대표팀',
            bh: 'Nacionalna'
        },
        search_coaches: {
            en: 'Coaches',
            br: 'Treinadores',
            es: 'Entrenadores',
            it: 'Allenatori',
            nl: 'Coaches',
            ro: 'Antrenori',
            sl: 'Trenerji',
            tr: 'Antrenörler',
            ko: '코치',
            bh: 'Treneri'
        },
        search_physios: {
            en: 'Physios',
            br: 'Fisioterapeutas',
            es: 'Fisioterapeutas',
            it: 'Fisioterapisti',
            nl: 'Fysiotherapeuten',
            ro: 'Fizioterapeuți',
            sl: 'Fizioterapevti',
            tr: 'Fizyoterapistler',
            ko: '물리치료사',
            bh: 'Fizioterapeuti'
        },
        search_transfers: {
            en: 'Transfers',
            br: 'Transferências',
            es: 'Transferencias',
            it: 'Trasferimenti',
            nl: 'Transfers',
            ro: 'Transferuri',
            sl: 'Prenosi',
            tr: 'Transferler',
            ko: '이적',
            bh: 'Transferi'
        },
        community_forum: {
            en: 'Forum',
            br: 'Fórum',
            es: 'Foro',
            it: 'Forum',
            nl: 'Forum',
            ro: 'Forum',
            sl: 'Forum',
            tr: 'Forum',
            ko: '포럼',
            bh: 'Forum'
        },
        community_rules: {
            en: 'Rules',
            br: 'Regras',
            es: 'Reglas',
            it: 'Regole',
            nl: 'Regels',
            ro: 'Reguli',
            sl: 'Pravila',
            tr: 'Kurallar',
            ko: '규칙',
            bh: 'Pravila'
        },
        community_profile: {
            en: 'Profile',
            br: 'Perfil',
            es: 'Perfil',
            it: 'Profilo',
            nl: 'Profiel',
            ro: 'Profil',
            sl: 'Profil',
            tr: 'Profil',
            ko: '프로필',
            bh: 'Profil'
        },
        community_links: {
            en: 'Links',
            br: 'Links',
            es: 'Enlaces',
            it: 'Link',
            nl: 'Links',
            ro: 'Link-uri',
            sl: 'Povezave',
            tr: 'Bağlantılar',
            ko: '링크',
            bh: 'Linkovi'
        }

    };
}

/**
 *
 */
function dropdownMenu() {
    const css = '.dropdown-content{text-align: left;top:0px;border-radius: 15px;margin-top:40px;display:none;position:absolute;background-color:#f1f1f1;min-width:160px;box-shadow:0 8px 16px 0 rgba(0,0,0,.2);z-index:1}.dropdown-content a{border-radius: 15px;color:#000;padding:12px 16px;text-decoration:none;display:block}.dropdown-content a:hover{background-color:#ddd}.menu_button:hover .dropdown-content{display:block}.menu_button:hover .dropbtn{background-color:#3e8e41}';
    applyStyle(css);

    const translation = getTranslation();
    let language = getLanguage();
    if (translation.home_home[language] == undefined)
        language = 'en';


    const menu = {
        home: [
            { url: 'https://www.dugout-online.com/home/none/', text: translation.home_home[language] },
            { url: 'https://www.dugout-online.com/news/none/', text: translation.home_news[language] },
            { url: 'https://www.dugout-online.com/rules/none/', text: translation.home_rules[language] },
            { url: 'https://www.dugout-online.com/helpmain/none/', text: translation.home_help[language] }
        ],
        club: [
            { url: 'https://www.dugout-online.com/clubinfo/none/', text: translation.club_info[language] },
            { url: 'https://www.dugout-online.com/clubinfo/bids/', text: translation.club_bids[language] },
            { url: 'https://www.dugout-online.com/clubinfo/transfers/', text: translation.club_transfers[language] },
            { url: 'https://www.dugout-online.com/players/none/', text: translation.club_players[language] },
            { url: 'https://www.dugout-online.com/players/none/view/youth/', text: translation.club_players_youth[language] },
            { url: 'https://www.dugout-online.com/staff/none/', text: translation.club_staff[language] },
            { url: 'https://www.dugout-online.com/settings/none/', text: translation.club_settings[language] }
        ],
        nt: [
            { url: 'https://www.dugout-online.com/players_nt/none/', text: translation.players_nt[language] },
            { url: 'https://www.dugout-online.com/tactics_nt/none/', text: translation.tactics_nt[language] }
        ],
        management: [
            { url: 'https://www.dugout-online.com/finances/none/', text: translation.management_finances[language] },
            { url: 'https://www.dugout-online.com/stadium/none/', text: translation.management_stadium[language] },
            { url: 'https://www.dugout-online.com/facilities/none/', text: translation.management_facilities[language] },
            { url: 'https://www.dugout-online.com/sponsors/none/', text: translation.management_sponsors[language] },
            { url: 'https://www.dugout-online.com/calendar/none/', text: translation.management_calendar[language] }
        ],
        tactics: [
            { url: 'https://www.dugout-online.com/tactics/none/', text: translation.tactics_fiest[language] },
            { url: 'https://www.dugout-online.com/tactics_youth/none/', text: translation.tactics_youth[language] }
        ],
        training: [
            { url: 'https://www.dugout-online.com/training/none/', text: translation.training_training[language] },
            { url: 'https://www.dugout-online.com/physios/none/', text: translation.training_physios[language] },
            { url: 'https://www.dugout-online.com/physio_report/none', text: translation.training_physio_report[language] }
        ],
        search: [
            { url: 'https://www.dugout-online.com/search_players/none/', text: translation.search_players[language] },
            { url: 'https://www.dugout-online.com/search_clubs/none/', text: translation.search_clubs[language] },
            { url: 'https://www.dugout-online.com/national_teams/none/', text: translation.search_national[language] },
            { url: 'https://www.dugout-online.com/search_coaches/none/', text: translation.search_coaches[language] },
            { url: 'https://www.dugout-online.com/search_physios/none/', text: translation.search_physios[language] },
            { url: 'https://www.dugout-online.com/search_transfers/none/', text: translation.search_transfers[language] }
        ],
        community: [
            { url: 'https://www.dugout-online.com/forum/none/', text: translation.community_forum[language] },
            { url: 'https://www.dugout-online.com/community_rules/none/', text: translation.community_rules[language] },
            { url: 'https://www.dugout-online.com/community_profile/none/', text: translation.community_profile[language] },
            { url: 'https://www.dugout-online.com/links/none/', text: translation.community_links[language] }
        ]
    };

    if ($('.menu_button').length <= 7) delete menu.nt;

    let menuIndex = 1;
    let dropdownContent = '';
    $.each(menu, (_menuKey, items) => {
        const $menuButton = $(`.menu_button:nth-child(${menuIndex})`);
        dropdownContent = '';
        $.each(items, (_index, item) => {
            dropdownContent += `<a href="${item.url}">${item.text}</a>`;
        });

        $menuButton.append(`<div class="dropdown-content">${dropdownContent}</div>`);
        menuIndex++;
    });

    [...document.querySelectorAll('div#top_container > div')]
        .filter((d) => d.classList.contains(`${d.id}_ico`))
        .forEach((d) => {
            const anchor = document.createElement('a');
            anchor.href = d.onclick.toString().split('document.location.href=')[1].split('\'')[1];
            anchor.classList.add(...d.classList.values());
            anchor.id = d.id;
            anchor.style.cssText = d.style.cssText;
            anchor.title = d.title;
            d.parentElement.insertBefore(anchor, d);
            d.remove();
        });
    const scripts = document.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.innerHTML && script.innerHTML.indexOf('createIconTip(') !== -1) {
            const novoScript = document.createElement('script');
            novoScript.type = 'text/javascript';
            novoScript.text = script.innerHTML;
            document.body.appendChild(novoScript);
            break;
        }
    }
}

/**
 *
 */
function pageTitle() {
    let title = '';
    if (page.includes('/clubinfo/none/')) title = $('.clubname').text();
    else {
        title = location.pathname.split('/')[1].replace('_', ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    $(document).prop('title', `Dugout-Online | ${title}`);
}

/**
 *
 */
function coachesWage() {
    $('.search_tbl tbody tr:first').append('<td width="36" class="table_header" valign="middle" align="center" style="cursor: default;" title="Approximate Wage">Wage</td>');

    $('.search_tbl tbody tr').each(function() {
        const data = $(this).children('td').map(function() {
            return $.isNumeric($(this).text()) ? parseInt($(this).text(), 10) : null;
        }).get().filter(Number);

        if (data.length > 0) {
            const max = Math.max(...data.slice(1, -5));
            let wage = (max <= 42) ? (24.44889 * max - 138.145) * max : (51.54712 * max - 1260) * max;
            wage = parseFloat(wage).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/ug, '$1,');

            $(this).append(`<td align="center"><span class="tableText">${wage}</span></td>`);
        }
    });

    $('.search_tbl th:first').wrapInner('<div />').find('div').unwrap().wrap('<th/>');
    const header = $('.search_tbl tr:first').clone();
    $('.search_tbl tr:first').remove();
    $('.search_tbl tbody:first').before('<thead></thead>');
    $('.search_tbl thead:first').append(header);

    $('.search_tbl').dataTable({
        searching: false,
        bPaginate: false,
        bLengthChange: false,
        bFilter: true,
        bInfo: false,
        bAutoWidth: false,
        order: [[13, 'asc']]
    });
}

/**
 *
 */
function scoutButton() {
    const clubid = $('a[href^=\'https://www.dugout-online.com/clubinfo/none/clubid/\']:eq(1)').attr('href').split('clubid/')[1];

    const rowIndex = $('table tbody tr').length - 18;
    $(`table > tbody > tr:eq(${rowIndex})`).append(`
        <td valign="middle" style="padding-left: 25px; padding-right: 1px;">
            <input type="button" value="Relatório do espião" onclick="document.location.href='https://www.dugout-online.com/clubinfo/analysis/clubid/${clubid}'">
        </td>
    `);
}

/**
 *
 */
function loadTactics() {
    $('#field_cont table').append('<tr><td valign="middle" style="color: unset;" colspan="2"><textarea id="dataTtc" name="dataTtc" rows="2" cols="40"></textarea></td><td valign="middle" style="color: unset;"><input type="button" value="Apply" id="apply"><input type="button" value="getTtc" id="getTtc"></td></tr>');

    $('#getTtc').click(() => {
        const data = {
            action: 'submit',
            // eslint-disable-next-line camelcase, no-undef
            players_ids: players[0].join(','),
            // eslint-disable-next-line no-undef
            positions: players[1].join(','),
            // eslint-disable-next-line camelcase, no-undef
            players_x: players[2].join(','),
            // eslint-disable-next-line camelcase, no-undef
            players_y: players[3].join(','),
            // eslint-disable-next-line no-undef
            substitutes: substitutes[0].join(','),
            // eslint-disable-next-line no-undef
            actions: actionsb,
            options: `${$('#agression_id').val()}*${$('#mentality_id option:selected').val()}*${$('#attack_wing_id option:selected').val()}*${$('#passing_id option:selected').val()}*${$('#capitan_sel option:selected').val()}*${$('#playmaker_sel option:selected').val()}*${$('#target_man_sel option:selected').val()}*${$('#penalty_sel option:selected').val()}*${$('#counter_attacks_id').prop('checked') ? '1' : '0'}*${$('#offside_trap_id').prop('checked') ? '1' : '0'}`
        };

        const queryString = $.param(data).replace(/%5B/ug, '').replace(/%5D/ug, '');
        const decodedQueryString = decodeURIComponent(queryString).replace(/ /ug, '+');

        $('#dataTtc').val(decodedQueryString);
    });

    $('#apply').click(() => {
        const xmlhttp = new XMLHttpRequest();
        let file = '';
        if (page.match('/tactics/none/')) file = 'tactics_save';
        if (page.match('/tactics_youth/none/')) file = 'tactics_youth_save';
        if (page.match('/tactics_nt/none/')) file = 'tactics_nt_save';
        const url = `${SERVER_URL}/ajaxphp/${file}.php`;

        if (!url) return;

        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send($('#dataTtc').val());
        location.reload();
    });
}

/**
 *
 * @param badge
 */
function extractLinkFromBadge(badge) {
    const onclickValue = badge.attr('onclick');
    if (onclickValue) {
        const startIndex = 24;
        const endIndex = onclickValue.length - 1;
        return onclickValue.substring(startIndex, endIndex);
    }
    return '';
}

/**
 *
 * @param link
 * @param badge
 * @param className
 */
function createTeamBadge(link, badge, className) {
    return $(`<a class="${className}" style='cursor: pointer; float: left; position: relative; margin-left: 2px; margin-top: 5px; width: 120px; height: 120px;' href="${link}">${badge.html()}</a>`);
}

/**
 *
 */
function teamLink() {
    const homeBadge = $('.generic_badge:first');
    const homeLink = extractLinkFromBadge(homeBadge);

    if (homeLink) {
        const homeBadgeLink = createTeamBadge(homeLink, homeBadge, 'home_badge');
        homeBadge.before(homeBadgeLink);
        homeBadge.remove();
        $('.home_badge').addClass('generic_badge');
    }

    const awayBadge = $('.generic_badge:last');
    const awayLink = extractLinkFromBadge(awayBadge);

    if (awayLink) {
        const awayBadgeLink = createTeamBadge(awayLink, awayBadge, 'away_badge');
        awayBadge.before(awayBadgeLink);
        awayBadge.remove();
        $('.away_badge').addClass('generic_badge');
    }
}

/**
 *
 * @param str
 */
function formatTime(str) {
    return (str || '00:00')
        // eslint-disable-next-line no-useless-escape
        .replace(/[\[\]: ]/ug, '')
        .replace(',', ':')
        .replace(/<[^>]+>/uig, '');
}

/**
 *
 * @param paramName
 */
function getUrlParameter(paramName) {
    const url = window.location.href;
    const match = url.match(new RegExp(`${paramName}/(\\d+)`, 'u'));

    return match ? match[1] : false;
}

/**
 *
 */
function configMenu() {

    /**
     *
     * @param configName
     * @param defaultValue
     */
    function getConfigOrDefault(configName, defaultValue) {
        return typeof configs[configName] !== 'undefined' && configs[configName] !== null ? configs[configName] : defaultValue;
    }

    const configOptions = [
        'SECONDARY_CLOCK', 'DROPDDOWN_MENU', 'PAGE_TITLE', 'TEAM_LINK',
        'SCOUT_BUTTON', 'COACHES_WAGE', 'PLAYER_OPS_NAME', 'PLAYER_EXP',
        'SQUAD_DETAILS', 'SQUAD_FILTERS', 'SQUAD_HIGH', 'SPREADSHEET_SQUAD',
        'LOAD_TACTICS', 'TACTICS_DETAILS', 'GOALS_DIFFERENCE'
    ];

    const configForm = $(`
        <div class="gui_object" style="width: 438px; margin-left: 8px; position: absolute; top: 0;">
            <div class="window1_wrapper" style="margin-top: 4px; width: 440px;">
                <div class="window1_header_start"></div>
                <div class="window1_header" style="width: 430px;">
                    <div class="window1_header_text">&nbsp;DO Genie Assistant Configs</div>
                    <a href="https://github.com/gabrielbitencourt/DOGenieAssistant/raw/main/DOGenieAssistant.user.js/" style="margin-left:8px; text-decoration: none; text-align: center; background-position: right; padding-right: 4px; padding-left: 4px; color: #393A39; font-weight: bold; border: 1px solid #A4B0A3; background-color: #D5E3D5; border-radius: 4px 4px 4px 4px; cursor: pointer;" target="_blank" style="margin-left: 10px;">
                    Update extension
                    </a>
                </div>
                <div class="window1_header_end"></div>
            </div>
            <div class="window1_wrapper" style="margin-top: 0px; width: 436px;">
                <div class="window1_content" style="width: 436px;">
                    <form name="configForm" action="#" method="post" class="configForm">
                       <table width="99%" border="0" cellspacing="1" cellpadding="1" class="matches_tbl" style="margin-bottom: 0px; margin-left: 3px; margin-top: 2px;">
                           <tbody></tbody>
                       </table>
                </div>
                <div class="window1_bottom" style="width: 438px;"></div>
            </div>
        </div>
    `).insertAfter('#footer');

    const tableBody = configForm.find('.matches_tbl tbody');

    let row = '<tr class=\'table_top_row\'>';
    const label = {
        DROPDDOWN: 'Dropdown',
        SECONDARY: 'Sec.',
        NAME: '',
        SPREADSHEET: 'Sheet'
    };
    configOptions.forEach((option, index) => {
        const defaultValue = getConfigOrDefault(option, 'checked');
        const optionCheckbox = `<input type="checkbox" name="${option}" ${defaultValue}>`;
        const optionLabel = option
            .split('_')
            .map((word) => (label[word] ?? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
            .join(' ');

        row += `<td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                    ${optionCheckbox} ${optionLabel}
                </td>`;

        if ((index + 1) % 4 === 0 && index !== configOptions.length - 1)
            row += '</tr><tr class=\'table_top_row\'>';

    });
    row += '</tr>';

    tableBody.append(row);

    const saveButton = $('<input id="saveConfig" type="submit" style="width: 136px;margin-top: 20px;" value="Save">');
    const defaultConfigStorageButton = $('<input id="defaultConfigStorage" type="submit" style="width: 160px;margin-top: 20px;" value="Defalut Config Storage">');
    const clearPlayerImagesButton = $('<input id="clearPlayerImages" type="submit" style="width: 140px;margin-top: 20px;" value="Clear Player Images">');

    configForm.find('.window1_content').append(saveButton, defaultConfigStorageButton, clearPlayerImagesButton);

    saveButton.click(() => {
        configOptions.forEach((option) => {
            const isChecked = $(`input[name="${option}"]`).is(':checked');
            configs[option] = isChecked ? 'checked' : '';
        });

        localStorage.setItem('DOGenieAssistant.configs', JSON.stringify(configs));
    });
}

/**
 *
 */
function defaultConfigStorage() {
    $('#defaultConfigStorage').click((e) => {
        localStorage.removeItem('DOGenieAssistant.configs');
        e.preventDefault();
    });
}

/**
 *
 */
function goalsDifference() {
    if ($('#myTable').length === 0)
        return;

    const isColspan = $('#myTable thead th[colspan]').length > 0;
    const ref = isColspan ? 9 : 8;

    if (isColspan) {
        $('#myTable th[colspan]').removeAttr('colspan');
        $('#myTable thead th:eq(1)').after($('<th>').text(''));
    }

    const $tbody = $('#myTable tbody');
    $tbody.find(`tr td:nth-child(${ref})`).each(function() {
        $(this).after($(this).clone());
    });

    $('<th>', {
        class: 'header',
        align: 'center',
        width: '70',
        style: 'border-left: solid 1px #999999;',
        text: 'PTS'
    }).appendTo('#myTable thead tr');

    // eslint-disable-next-line new-cap
    const table = $('#myTable').DataTable({
        searching: false,
        paging: false,
        lengthChange: false,
        info: false,
        autoWidth: false
    });

    table.column(ref).data().each((_value, index) => {
        const gpColValue = table.cell(index, ref - 2).data();
        const gcColValue = table.cell(index, ref - 1).data();
        const difference = parseFloat(gpColValue) - parseFloat(gcColValue);
        table.cell(index, ref).data(parseFloat(difference.toFixed(2)));
    });
    $(`#myTable thead tr th:nth-child(${ref + 1})`).text('GD');
}

// #endregion

/**
 *
 * @param config
 * @param func
 */
function checkAndExecute(config, func) {
    if ((config) || (typeof config === 'undefined')) func();
}

checkAndExecute(configs.PAGE_TITLE, pageTitle);
checkAndExecute(configs.DROPDDOWN_MENU, dropdownMenu);
checkAndExecute(configs.SECONDARY_CLOCK, secondaryClock);

if (page.includes('/home/none/')) {
    configMenu();
    defaultConfigStorage();

    checkAndExecute(configs.TEAM_LINK, teamLink);
}
else if (page.includes('/search_coaches/none/')) checkAndExecute(configs.COACHES_WAGE, coachesWage);
else if (page.includes('/clubinfo/none/')) checkAndExecute(configs.SCOUT_BUTTON, scoutButton);
else if (page.includes('/players/details/')) playerDetails();
else if (page.includes('/players/spreadsheet/')) checkAndExecute(configs.SPREADSHEET_SQUAD, () => doTable('.forumline'));
else if (page.match('/competitions/none')) checkAndExecute(configs.GOALS_DIFFERENCE, goalsDifference);
else if (page.includes('/players/none/') || page.includes('/players_nt/none/')) {
    checkAndExecute(configs.SQUAD_DETAILS, squadDetails);
    checkAndExecute(configs.SQUAD_FILTERS, squadFilters);
}
else if (page.includes('/tactics/none/') || page.includes('/tactics_youth/none/') || page.includes('/tactics_nt/none/')) {
    checkAndExecute(configs.TACTICS_DETAILS, tacticsDetails);
    checkAndExecute(configs.LOAD_TACTICS, loadTactics);
}
