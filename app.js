//https://anilist.co/graphiql
//https://medium.com/nerd-for-tech/how-to-fetch-data-from-the-anilist-api-graphql-using-axios-77527efc8a89

const index = document.querySelector('#index')
const form = document.querySelector('#form')
//const search = document.querySelector('#search')
const title = document.querySelector('#content h1')
const paragraph = document.querySelector('#content p')
const img = document.querySelector('#content img')
let ctx = document.getElementById('chart').getContext('2d');

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
  page: 1,
  perPage: 50,
}

fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query, variables })
})
.then(response => response.json())
.then(data => {
  window.dataset = data.data.Page.media
  console.log(data.data.Page.media);
  showAnimes(window.dataset)
});


function showAnimes(animes) {
  const statsDist = animes[0].stats.statusDistribution
  const scoreDist = animes[0].stats.scoreDistribution
  
  // var stats = convertList(statsDist)
  // drawChart(stats)
  //console.log(stats)

  //set initial content
  index.innerHTML = ''
  title.innerHTML = animes[0].title.english
  paragraph.innerHTML = animes[0].description
  img.src = animes[0].coverImage.large
  img.alt = animes[0].title.english
  let stats = convertList(animes[0].stats.statusDistribution)
  

  animes.forEach((anime) => {
    const {title: {english}, averageScore, coverImage: {large}, description, stats: {statusDistribution}} = anime

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
      stats = convertList(statusDistribution)
      console.log(stats)
      drawChart(stats)
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

function drawChart(amount) {
  let myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: ['Current', 'Planning', 'Completed', 'Dropped', 'Paused', 'Repeating'],
          datasets: [{
              label: '# of Votes',
              data: amount,
              backgroundColor: [
                  'rgba(255, 99, 132)',
                  'rgba(54, 162, 235)',
                  'rgba(255, 206, 86)',
                  'rgba(75, 192, 192)',
                  'rgba(153, 102, 255)',
                  'rgba(255, 159, 64)'
              ]
          }]
      }
  });
}

function convertList(originalList) {
  var result = originalList.map(function (obj) {
    return obj.amount;
  });
  return result
}





