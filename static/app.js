//https://anilist.co/graphiql
//https://medium.com/nerd-for-tech/how-to-fetch-data-from-the-anilist-api-graphql-using-axios-77527efc8a89

const index = document.querySelector('#index')
const form = document.querySelector('#form')
const search = document.querySelector('#search')

const query = `
query ($page: Int, $perPage: Int, $search: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
    }
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      type
      genres
      averageScore
      description
      coverImage {
        large
      }
    }
  }
}
`;

let variables = {
  id: 21087
}

fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query, variables: variables })
})
.then(response => response.json())
.then(data => {
  console.log(data.data.Page.media);
  showAnimes(data.data.Page.media)
});


function showAnimes(animes) {
  index.innerHTML = ''

  animes.forEach((anime) => {
    const {title: {english}, averageScore, coverImage: {large}, description} = anime
    
    const animeEl = document.createElement('div')
    animeEl.classList.add('anime')

    animeEl.innerHTML = `
      <img src="${large}" alt="${english}">
      <div class="anime-info">
          <h3>${english}</h3>
          <span class="${getClassByRate(averageScore)}">${averageScore}</span>
      </div>
    `
    index.appendChild(animeEl)
  })
}

function getClassByRate(score) {
  if (score >= 80) {
      return 'green'
  } else if (score >= 50) {
      return 'orange'
  } else {
      return 'red'
  }
}