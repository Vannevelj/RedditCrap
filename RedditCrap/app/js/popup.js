var shittyCrapSites = ['dailymail.co.uk', 'independent.co.uk', 'ibtimes.co.uk', 'huffingtonpost.com', 'rt.com', 'express.co.uk', 'telegraph.co.uk'];
var config;

// We have to load our configuration file first
var xhr = new XMLHttpRequest();
xhr.onload = init;
xhr.open("GET", chrome.extension.getURL('/app/conf/config.json'), true);
xhr.send();

function init() {
    config = JSON.parse(xhr.response);

    // We seed the storage with crappy sites if none are found yet
    chrome.storage.sync.get(['crappySites', 'crappyAction'], function(data) {
        if (!data.crappySites || data.crappySites.length === 0) {
            chrome.storage.sync.set({ 'crappySites': shittyCrapSites }, function() { });
        }

        if (!data.crappyAction) {
            chrome.storage.sync.set({ 'crappyAction': config.DESIRED_ACTION_HIGHLIGHT }, function() { });
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    displaySavedSettings();

    document.getElementById('siteForm').addEventListener('submit', add);
    document.getElementById('reset').addEventListener('click', reset);
    document.getElementById('crappyAction').addEventListener('change', actionSettingChanged);
});

function displaySavedSettings() {
    // Get the existing values from storage
    chrome.storage.sync.get(['crappySites', 'crappyAction'], function(data) {
        // Add them to the list
        data.crappySites.forEach(function(element) {
            addListElement(element);
        }, this);

        var selectElement = document.getElementById('crappyAction');
        selectElement.selectedIndex = data.crappyAction;
    });
}

function addListElement(value) {
    if (!value) {
        return;
    }

    var resultList = document.getElementById('crappySites');
    var inputField = document.getElementById('siteInput');

    var newItem = document.createElement('li');
    newItem.setAttribute('id', value);
    newItem.appendChild(document.createTextNode(value + ' '));

    var newCancelImage = document.createElement('img');
    newCancelImage.setAttribute('src', '../res/cross.png');
    newCancelImage.addEventListener('click', function() { remove(value); });
    newItem.appendChild(newCancelImage);

    resultList.appendChild(newItem);
    inputField.value = '';
}

function remove(value) {
    chrome.storage.sync.get('crappySites', function(data) {
        var sites = data.crappySites;
        console.log('trying to remove ' + value);

        var newSites = [];
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] !== value) {
                newSites.push(sites[i]);
            }
        }

        console.log('new list: ' + newSites);

        chrome.storage.sync.set({ 'crappySites': newSites }, function() { });

        var resultList = document.getElementById('crappySites');
        resultList.removeChild(document.getElementById(value));
    });
}

function add(e) {
    e.preventDefault();

    var inputField = document.getElementById('siteInput');
    var value = inputField.value;
    addListElement(value);

    chrome.storage.sync.get('crappySites', function(data) {
        var sites = data.crappySites;
        sites.push(value);
        chrome.storage.sync.set({ 'crappySites': sites }, function() { });
    });
}

function reset() {
    chrome.storage.sync.set({ 'crappySites': shittyCrapSites }, function() { });

    var resultList = document.getElementById('crappySites');
    var newResultList = document.createElement('ul');
    newResultList.setAttribute('id', 'crappySites');

    resultList.parentElement.replaceChild(newResultList, resultList);

    shittyCrapSites.forEach(function(element) {
        addListElement(element);
    }, this);
}

function actionSettingChanged() {
    var selectElement = document.getElementById('crappyAction');
    var selectedOption = selectElement.selectedIndex;

    chrome.storage.sync.set({ 'crappyAction': selectedOption }, function() { });
}