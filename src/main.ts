import * as bluebird from 'bluebird';
import * as moment from 'moment';
import * as yargs from 'yargs';

import { Scraper } from './scraper';

function daily() {
    const logPrefix = 'main::daily';
    console.log(logPrefix);
    const date = new Date();
    const day = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    console.log(`${logPrefix} scrapping data for date: ${day}`);
    const scraper = new Scraper();
    return scraper.login()
        .then(() => scraper.extractTrainingDay(day))
        .then(() => scraper.stop());
}

function period() {
    const logPrefix = 'main::period';
    console.log(logPrefix);
    if (!argv.startDate || !argv.endDate) {
        console.log(`${logPrefix} start or end date missing!`);
    }

    const startDate = moment(argv.startDate as string);
    const endDate = moment(argv.endDate as string);
    const days: string[] = [];
    for (const m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
        console.log(m.format('YYYY-MM-DD'));
        days.push(m.format('YYYY-MM-DD'));
    }

    const scraper = new Scraper();
    return scraper.login()
        .then(() => {
            return bluebird.mapSeries(days, (day) => scraper.extractTrainingDay(day));
        })
        .then(() => scraper.stop());
}

const argv = yargs
    .usage('Usage: $0 <command> [options]')
    .alias('s', 'startDate')
    .nargs('s', 1)
    .alias('e', 'endDate')
    .nargs('e', 1)
    .help()
    .alias('help', 'h')
    .argv;

if (argv.startDate || argv.endDate) {
    period()
        .then(() => console.log('Done'));
} else {
    daily()
        .then(() => console.log('Done'));
}
