import * as path from 'path';
import * as puppeteer from 'puppeteer';

class Scraper {
    private loginUrl = 'https://app.theforgeconcept.de/login';
    private trainingDayBaseUrl = 'https://app.theforgeconcept.de/plan/day/';
    private email = 'danielmaucher@gmx.de';
    private password = 'vollmilch23';

    private emailSelector = '#root > div.css-wrcj3k.e1q2upmg0 > div.css-e3hfer.e1q2upmg1 > div > form > div.css-nhd2jm.e12tjqvd4 > input';
    private pwSelector = '#root > div.css-wrcj3k.e1q2upmg0 > div.css-e3hfer.e1q2upmg1 > div > form > div.css-pf71uq.e12tjqvd2 > input';
    private submitSelector = '#root > div.css-wrcj3k.e1q2upmg0 > div.css-e3hfer.e1q2upmg1 > div > form > div.css-rkv3h4.e12tjqvd1 > button';

    private workoutSelector = '#root > div.bg-grey-lightest > div.css-1ou0lb5.ea59lmr0 > div > div > div.flex.w-full.py-4.justify-center.flex-wrap > div > div.css-1nzcn15.e1q7svta0 > div.css-14zt9ip.e48drxd0';

    private browser: puppeteer.Browser;
    private page: puppeteer.Page;

    public login() {
        const logPrefix = 'Scraper::login';
        console.log(logPrefix);
        return puppeteer.launch({ headless: true })
            .then((browser: puppeteer.Browser) => {
                this.browser = browser;
                return this.browser.newPage();
            })
            .then((page: puppeteer.Page) => {
                this.page = page;
                return this.page.goto(this.loginUrl, { waitUntil: 'networkidle0' });
            })
            .then(() => {
                return this.page.click(this.emailSelector)
                    .then(() => this.page.keyboard.type(this.email))
                    .then(() => this.page.click(this.pwSelector))
                    .then(() => this.page.keyboard.type(this.password))
                    .then(() => this.page.click(this.submitSelector))
                    .then(() => this.page.waitForNavigation({ waitUntil: 'networkidle0' }));
            })
            .then(() => console.log(`${logPrefix} Login successfull.`))
            .catch((err: Error) => console.log(`Error due to ${err}`));
    }

    public extractTrainingDay(day: string) {
        const logPrefix = `Scraper::extractTrainingDay ${day}`;
        console.log(logPrefix);
        return this.page.goto(path.join(this.trainingDayBaseUrl, day), { waitUntil: 'networkidle0' })
            .then(() => this.page.pdf({
                format: 'A4',
                path: `pictures\\${day}.pdf`
            }));
    }

    public stop() {
        const logPrefix = 'Scraper::stop';
        console.log(logPrefix);
        if (!this.browser) {
            console.log(`${logPrefix} No browser opened, resolving.`);
            return Promise.resolve();
        }
        return this.browser.close();
    }


}

export { Scraper };
