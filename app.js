//https://anilist.co/graphiql
//https://medium.com/nerd-for-tech/how-to-fetch-data-from-the-anilist-api-graphql-using-axios-77527efc8a89

const index = document.querySelector('#index')
// const form = document.querySelector('#form')
// const search = document.querySelector('#search')
const content = document.querySelector('#content')
const title = document.querySelector('#content h1')
const ep = document.querySelector('#episodes')
const stDate = document.querySelector('#startDate')
const edDate = document.querySelector('#endDate')
const genreList = document.querySelector('ul')
const paragraph = document.querySelector('#description')
const img = document.querySelector('#content img')
const ctxStatus = document.getElementById('statusChart').getContext('2d');
const ctxScore = document.getElementById('scoreChart').getContext('2d');

let searchTerm
let statusChart
let scoreChart

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
        month
        day
        year
      }
      endDate {
        month
        day
        year
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
  search: searchTerm
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
  
  //set initial content
  index.innerHTML = ''
  title.innerHTML = animes[0].title.english
  ep.innerHTML = animes[0].episodes
  stDate.innerHTML = convertDate(animes[0].startDate)
  edDate.innerHTML = convertDate(animes[0].endDate)
  paragraph.innerHTML = animes[0].description
  img.src = animes[0].coverImage.large
  img.alt = animes[0].title.english
  animes[0].genres.forEach((genre) => {
    const li = document.createElement('li')
    li.innerHTML = genre
    genreList.appendChild(li)
  })

  // draw status & score chart
  let status = convertList(animes[0].stats.statusDistribution)
  statusChart = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
        labels: ['Current', 'Planning', 'Completed', 'Dropped', 'Paused', 'Repeating'],
        datasets: [{
            data: status,
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)'
            ],
            borderColor: 'rgb(230, 231, 235)',
        }]
    }
  });
  let score = convertList(animes[0].stats.scoreDistribution)
  scoreChart = new Chart(ctxScore, {
      type: 'bar',
      data: {
          labels: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
          datasets: [{
              label: 'scores',
              data: score,
              backgroundColor: [
                  'rgba(193, 0, 0, 0.5)',
                  'rgba(178, 21, 0, 0.5)',
                  'rgba(163, 41, 0, 0.5)',
                  'rgba(147, 62, 0, 0.5)',
                  'rgba(132, 83, 0, 0.5)',
                  'rgba(117, 103, 0, 0.5)',
                  'rgba(102, 124, 0, 0.5)',
                  'rgba(86, 145, 0, 0.5)',
                  'rgba(71, 165, 0, 0.5)',
                  'rgba(56, 186, 0, 0.5)'
              ],
              borderColor: [
                  'rgba(193, 0, 0, 1)',
                  'rgba(178, 21, 0, 1)',
                  'rgba(163, 41, 0, 1)',
                  'rgba(147, 62, 0, 1)',
                  'rgba(132, 83, 0, 1)',
                  'rgba(117, 103, 0, 1)',
                  'rgba(102, 124, 0, 1)',
                  'rgba(86, 145, 0, 1)',
                  'rgba(71, 165, 0, 1)',
                  'rgba(56, 186, 0, 1)',
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  // add anime elements to index
  animes.forEach((anime) => {
    const {title: {english}, averageScore, coverImage: {large}, episodes, startDate, endDate, genres, description, stats: {statusDistribution, scoreDistribution}} = anime

    const animeEl = document.createElement('div')
    animeEl.classList.add('anime')
    animeEl.innerHTML = `
      <img src="${large}" alt="${english}">
      <div class="anime-info">
          <h3>${english}</h3>
          <span class="${getClassByRate(averageScore)}">${averageScore}</span>
      </div>
    `
    // eventlistener to update content
    animeEl.addEventListener('click', ()=> {
      //update content
      title.innerHTML = english
      ep.innerHTML = episodes
      stDate.innerHTML = convertDate(startDate)
      edDate.innerHTML = convertDate(endDate)
      paragraph.innerHTML = description
      img.src = large
      img.alt = english
      genreList.innerHTML = ''
      genres.forEach((genre) => {
        const li = document.createElement('li')
        li.innerHTML = genre
        genreList.appendChild(li)
      })
      //update status & score chart
      statusChart.data.datasets[0].data = convertList(statusDistribution)
      statusChart.update()
      scoreChart.data.datasets[0].data = convertList(scoreDistribution)
      scoreChart.update()
    })
    index.appendChild(animeEl)
  })
}


// form.addEventListener('submit', (e) => {
//   e.preventDefault()

//   searchTerm = search.value
//   console.log(window.dataset)
//   console.log(searchTerm)
// })


function getClassByRate(score) {
  if (score >= 80) {
      return 'green'
  } else if (score >= 50) {
      return 'orange'
  } else {
      return 'red'
  }
}

function convertList(jsonList) {
  var data = jsonList.map(function (obj) {
    return obj.amount;
  });
  return data
}

function convertDate(jsonDate) {
  const months = ["January ", "February ", "March ", "April ", "May ", "June ", "July ", "August ", "September ", "October ", "November ", "December "]
  var date = Object.values(jsonDate)
  return months[date[0]-1] + date[1] + ", " + date[2]
}

function openContent() {
  content.style.display = "block";
}

function closeContent() {
  content.style.display = "none";
}