import * as bluebird from 'bluebird';
import * as moment from 'moment';
import * as yargs from 'yargs';

import { Scraper } from './scraper';

const dateFormat = 'YYYY-MM-DD';

function daily() {
    const logPrefix = 'main::daily';
    console.log(logPrefix);
    const date = new Date();
    const day = moment().format(dateFormat);
    const cw = moment().isoWeek().toString();
    console.log(`${logPrefix} scrapping data for date: ${day} / ${cw}`);
    const scraper = new Scraper();
    return scraper.login()
        .then(() => scraper.extractTrainingDay(day, cw))
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
    const days: Array<{ day: string, cw: string }> = [];
    for (const m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
        const obj = {
            cw: m.isoWeek().toString(),
            day: m.format(dateFormat)
        };
        console.log(obj);
        days.push(obj);
    }
    const scraper = new Scraper();
    return scraper.login()
        .then(() => {
            return bluebird.mapSeries(days, ({ day, cw }) => scraper.extractTrainingDay(day, cw));
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
