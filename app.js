const search = document.querySelector(`.search`);
const searchInput = document.querySelector(`.search__input`);
const searchAutoComplete = document.querySelector(`.search__autocomplete`);
const starred = document.querySelector(`.starred`);

function debounce(f, ms) {
    let isTrue = false;
    return function() {
        if (isTrue) return;
        f.apply(this, arguments);
        isTrue = true;
        setTimeout(() => isTrue = false, ms);
    };
}

const getRepositories = function(value) {
    fetch(`https://api.github.com/search/repositories?q=${value}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Ошибка запроса!');
            }
            return response.json();
        })
        .then((data) => {
            let repositories = data.items.filter((dataItem, dataItemIndex) => {
                if (dataItemIndex < 5) {
                    return true;
                }
            })
            addRepositories(repositories);
        })
        .catch((err) => {
            console.log(err);
        })
};

const clickAddStarred = function (event) {
    let target = event.target;
    console.log(target);
    addStarred();
}

const removeRepositories = function() {
    search.classList.remove(`active`);
    if (searchAutoComplete.firstChild) {
        searchAutoComplete.removeChild(searchAutoComplete.lastChild)
    }

    searchAutoComplete.removeEventListener(`click`, clickAddStarred);
}

searchInput.addEventListener("input", debounce(function(event) {
    removeRepositories();
    let request = searchInput.value;
    if (event.keyCode !== 32 && request.length !== 0) {
        getRepositories(request);
    }
}, 1500));



const addRepositories = function(repositories) {
    search.classList.add(`active`)
    if (repositories.length === 0) {
        const item = document.createElement(`li`);
        item.textContent = `Ничего не найдено =(`;
        searchAutoComplete.appendChild(item);
    } else {
        const repositoriesList = document.createDocumentFragment();
        const itemUL = document.createElement(`ul`);
        repositoriesList.appendChild(itemUL);
        repositories.forEach((repositoriesItem, repositoriesItemIndex) => {
            const itemLI = document.createElement(`li`);
            itemLI.textContent = repositoriesItem.name;
            itemUL.appendChild(itemLI);
        })

        searchAutoComplete.appendChild(repositoriesList);
        searchAutoComplete.addEventListener(`click`, clickAddStarred);
    }
}

const addStarred = function () {
    const starredCard = document.createDocumentFragment();

    const cardDiv = document.createElement(`div`);
    cardDiv.classList.add(`starred-card`)
    starredCard.appendChild(cardDiv);
    const cardName = document.createElement(`p`);
    cardName.textContent = `Test`;
    cardDiv.appendChild(cardName);
    const cardOwner = document.createElement(`p`);
    cardOwner.textContent = `Test`;
    cardDiv.appendChild(cardOwner);
    const cardStars = document.createElement(`p`);
    cardStars.textContent = `Test`;
    cardDiv.appendChild(cardStars);
    const cardButton = document.createElement(`button`);
    cardButton.classList.add(`card__button`)
    cardDiv.appendChild(cardButton);

    starred.appendChild(starredCard);

    const removeStarred = function (event) {
        let target = event.target;
        target.parentElement.remove();
        cardDiv.removeEventListener(`click`, removeStarred);
    }    

    cardDiv.addEventListener(`click`, removeStarred);
}