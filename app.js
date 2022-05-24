//https://anilist.co/graphiql
//https://medium.com/nerd-for-tech/how-to-fetch-data-from-the-anilist-api-graphql-using-axios-77527efc8a89

const index = document.querySelector('#index')
const form = document.querySelector('#form')
//const search = document.querySelector('#search')
const title = document.querySelector('#content h1')
const paragraph = document.querySelector('#content p')
const img = document.querySelector('#content img')

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
        english
      }
      type
      genres
      averageScore
      description
      coverImage {
        large
      }
      startDate {
        year
        month
      }
      endDate {
        year
        month
      }
      episodes
      stats {
        statusDistribution {
          status
          amount
        }
        scoreDistribution {
          score
          amount
        }
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
  window.dataset = data.data.Page.media
  console.log(window.dataset);
  showAnimes(window.dataset)
});


function showAnimes(animes) {
  console.log(animes[0].coverImage.large)

  index.innerHTML = ''
  title.innerHTML = animes[0].title.english
  paragraph.innerHTML = animes[0].description
  img.src = animes[0].coverImage.large
  img.alt = animes[0].title.english

  
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
    animeEl.addEventListener('click', ()=> {
      title.innerHTML = english
      paragraph.innerHTML = description
      img.src = large
      img.alt = english

      // window.dataset.forEach((item) => {
      //   if (item.id == 20) {
      //     console.log(item.description)
      //   }
      // })
    })
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