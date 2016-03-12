var shittyCrapSites = ['dailymail.co.uk', 'independent.co.uk', 'ibtimes.co.uk', 'huffingtonpost.com', 'rt.com', 'express.co.uk', 'telegraph.co.uk'];

// We seed the storage with crappy sites if none are found yet
chrome.storage.sync.get(['crappySites', 'crappyAction', 'crappyColor'], function (data) {
    if (!data.crappySites || data.crappySites.length === 0) {
        chrome.storage.sync.set({ 'crappySites': shittyCrapSites }, function () {});
    }

    var selectElement = document.getElementById('crappyAction');
    if (!data.crappyAction) {
        chrome.storage.sync.set({ 'crappyAction': 1 }, function () {});
    } else {
        selectElement.selectedIndex = data.crappyAction;
    }

   var selectElement2 = document.getElementById('radioColor');
    if (!data.crappyColor) {
        var color = document.querySelector('input[name = "color"]:checked').value;
        chrome.storage.sync.set({ 'crappyColor': color }, function () {});
    } else {
        selectElement2.value = data.crappyColor;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    displayExistingFilters();

    document.getElementById('siteForm').addEventListener('submit', add);
    document.getElementById('reset').addEventListener('click', reset);
    document.getElementById('crappyAction').addEventListener('change', actionSettingChanged);
    var radios = document.forms["radio-form"].elements["color"];
    
    for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        colorSettingChanged();
    }
}
});

function displayExistingFilters() {
    // Get the existing filters from storage
    chrome.storage.sync.get('crappySites', function (data) {
        // Add them to the list
        data.crappySites.forEach(function (element) {
            addListElement(element);
        }, this);
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
    newCancelImage.addEventListener('click', function () { remove(value); });
    newItem.appendChild(newCancelImage);

    resultList.appendChild(newItem);
    inputField.value = '';
}

function remove(value) {
    chrome.storage.sync.get('crappySites', function (data) {
        var sites = data.crappySites;
        console.log('trying to remove ' + value);

        var newSites = [];
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] !== value) {
                newSites.push(sites[i]);
            }
        }

        console.log('new list: ' + newSites);

        chrome.storage.sync.set({ 'crappySites': newSites }, function () {});

        var resultList = document.getElementById('crappySites');
        resultList.removeChild(document.getElementById(value));
    });
}

function add(e) {
    e.preventDefault();

    var inputField = document.getElementById('siteInput');
    var value = inputField.value;
    addListElement(value);

    chrome.storage.sync.get('crappySites', function (data) {
        var sites = data.crappySites;
        sites.push(value);
        chrome.storage.sync.set({ 'crappySites': sites }, function () {});
    });
}

function reset() {
    chrome.storage.sync.set({ 'crappySites': shittyCrapSites }, function () {});

    var resultList = document.getElementById('crappySites');
    var newResultList = document.createElement('ul');
    newResultList.setAttribute('id', 'crappySites');

    resultList.parentElement.replaceChild(newResultList, resultList);

    shittyCrapSites.forEach(function (element) {
        addListElement(element);
    }, this);
}

function actionSettingChanged() {
    var selectElement = document.getElementById('crappyAction');
    var selectedOption = selectElement.selectedIndex;

    chrome.storage.sync.set({ 'crappyAction': selectedOption }, function () {});
}

function colorSettingChanged() {
    var selectedOption = document.querySelector('input[name = "color"]:checked').value;

    chrome.storage.sync.set({ 'crappyColor': selectedOption }, function () {});
}