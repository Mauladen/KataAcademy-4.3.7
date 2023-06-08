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

// Получаем репозитории по запросу
async function getRepositories (value) {
    let response = await fetch(`https://api.github.com/search/repositories?q=${value}`)
    .then((response) => {
        // Проверяем успешность запроса и выкидываем ошибку
        if (!response.ok) {
            throw new Error('Ошибка запроса!')
        }

        return response.json();
    })
    .catch((err) => {
        console.log(err)
    })

    // Нам нужно только 5 репозиториев
    let repositories = [];

    for (let i = 0; i < 5; i++) {
        repositories.push(response.items[i]);
    }

    return repositories;
};

// Добавляем репозиторий в избранное
const clickAddStarred = function (event) {
    let target = event.target;
    console.dir(target);
    addStarred(target);
    searchInput.value = ``;
    removeRepositories();
}

// Очищаем автокомплит
const removeRepositories = function() {
    search.classList.remove(`active`);
    if (searchAutoComplete.firstChild) {
        searchAutoComplete.removeChild(searchAutoComplete.lastChild)
    }

    searchAutoComplete.removeEventListener(`click`, clickAddStarred);
}

searchInput.addEventListener("keyup", debounce(async function(event) {
    let repositories; // Репозитории по запросу
    let request = searchInput.value; // Значение в поле ввода

    if (event.keyCode !== 32 && request.length !== 0) {
        repositories = await getRepositories(request);
        addRepositories(repositories);
        console.log(repositories);
    }
}, 400));



const addRepositories = function(repositories) {
    removeRepositories();
    if (repositories.length === 0) {
        const item = document.createElement(`li`);
        item.textContent = `Ничего не найдено =(`;
        searchAutoComplete.appendChild(item);
    } else {
        const repositoriesList = document.createDocumentFragment();
        const itemUL = document.createElement(`ul`);
        repositoriesList.appendChild(itemUL);
        repositories.forEach((repositoriesItem) => {
            const itemLI = document.createElement(`li`);
            itemLI.textContent = repositoriesItem.name;
            itemLI.gitHubName = repositoriesItem.name;
            itemLI.gitHubOwner = repositoriesItem.owner.login;
            itemLI.gitHubStarred = repositoriesItem.stargazers_count;            ;
            itemUL.appendChild(itemLI);
        })

        searchAutoComplete.appendChild(repositoriesList);
        searchAutoComplete.addEventListener(`click`, clickAddStarred);

    }

    search.classList.add(`active`); // Показываем репозитории
}

const addStarred = function (target) {
    const starredCard = document.createDocumentFragment();

    const cardDiv = document.createElement(`div`);
    cardDiv.classList.add(`starred-card`)
    starredCard.appendChild(cardDiv);
    const cardName = document.createElement(`p`);
    cardName.textContent = `Имя репозитория: ${target.gitHubName}`;
    cardDiv.appendChild(cardName);
    const cardOwner = document.createElement(`p`);
    cardOwner.textContent = `Владелец: ${target.gitHubOwner}`;
    cardDiv.appendChild(cardOwner);
    const cardStars = document.createElement(`p`);
    cardStars.textContent = `Количество звёзд: ${target.gitHubStarred}`;
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