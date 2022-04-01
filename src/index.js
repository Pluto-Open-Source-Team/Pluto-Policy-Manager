import { AUTH, STORAGE, EVENTS } from '@/js/config.js';
import SetupTabs from '@/js/views/setup-tabs-view.js';
import Header from '@/js/views/header-view.js';
import Footer from '@/js/views/footer-view.js';
import authService from '@/js/services/auth.service.js';
import Diagram from '@/js/views/diagram-view.js';
import '@/styles/style.css';

const renderSetupPage = async (elem) => {
    elem.innerHTML = await SetupTabs.render();
    await SetupTabs.post_render();
};

const renderHeaderNFooter = async (headerElem, footerElem) => {
    headerElem.innerHTML = await Header.render();
    await Header.post_render();

    footerElem.innerHTML = await Footer.render();
    await Footer.post_render();
};

const renderDiagram = async (elem) => {
    elem.innerHTML = await Diagram.render();
    await Diagram.post_render();
};

const app = async () => {
    // Load view elements
    const headerElement = document.getElementById('header');
    const footerElement = document.getElementById('footer');
    const contentElement = document.getElementById('content');

    let auth2Instance = {};

    // Get App Settings
    const appSettings = localStorage.getItem(STORAGE.APP_SETTINGS);

    // Detect if the user signed in
    document.addEventListener(EVENTS.USER_AUTHENTICATED, async (e) => {
        if (e.detail && e.detail.isAuthenticated) {
            /*
             render protected pages
             */
            await renderHeaderNFooter(headerElement, footerElement); // Render Header and Footer
            // await renderMainModal(contentElement); // Render Main Modal
            await renderDiagram(contentElement);
        } else {
            await renderSetupPage(contentElement);
        }
    });

    if (appSettings && JSON.parse(appSettings).googleClientId) {
        authService
            .initGoogleAuth({
                client_id: JSON.parse(appSettings).googleClientId,
                scope: AUTH.SCOPE,
            })
            .then(async () => {
                if (gapi.auth2.getAuthInstance()) {
                    auth2Instance = gapi.auth2.getAuthInstance();

                    if (auth2Instance.isSignedIn.get()) {
                        // is authenticated
                        localStorage.setItem(
                            STORAGE.ACCESS_TOKEN,
                            JSON.stringify(authService.getAccessToken(auth2Instance))
                        );

                        /*
                        render protected pages
                         */
                        await renderHeaderNFooter(headerElement, footerElement); // Render Header and Footer
                        // await renderMainModal(contentElement); // Render Main Modal
                        await renderDiagram(contentElement); // Render Main Modal
                    } else {
                        // not authenticated
                        await renderSetupPage(contentElement);
                    }
                } else {
                    // no instance
                    await renderSetupPage(contentElement);
                }
            })
            .catch(async () => {
                await renderSetupPage(contentElement);
            });
    } else {
        await renderSetupPage(contentElement);
    }
};

document.addEventListener('DOMContentLoaded', app);