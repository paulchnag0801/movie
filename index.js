const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/' //被用來處理圖片檔案
const Movies_PER_PAGE = 12

const movies = []
let filteredMovies = []
let nowPage = 1
let mode = 'card'
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-Mode')
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//render這個方式，就是把資料經過處理過後，變成html元素把它放進dom tree或是html裡面。
function displayDataList() {
  const moveList = getMoviesByPage(nowPage)
  mode === 'card' ? renderMovieListCardMode(moveList) : renderMovieListListMode(moveList)
}

function renderMovieListCardMode(data) {
    let rawHTML = ' '
    // processing
    data.forEach((item) => {
      //title,image
     console.log (item)
     rawHTML += ` <div class="col-sm-3 col-md-3 col-lg-3 mb-3">
          <div class="d-flex mx-auto">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top" alt="Movie Poster"/>
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id= "${item.id}" > More </button>
                <button class="btn btn-info btn-add-favorite" data-id= "${item.id}"> + </button>
              </div>
            </div>
          </div>
        </div>`
    })
    

    dataPanel.innerHTML = rawHTML
}

function renderMovieListListMode(data) {
  let rawHTML = ''
  rawHTML += '<table class="table"><tbody>'
  data.forEach (item => {
    rawHTML += `
        <tr>
          <td>
              <h5 class="card-title">${item.title}</h5>
          </td>
          <td>
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </td>
        </tr>
    `
  })
  rawHTML += '</tbody></table>'
  dataPanel.innerHTML = rawHTML
}

function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / Movies_PER_PAGE)
  let rawHTML = ''

  for (let page = 1 ; page <=numberOfPages ; page ++) {
   rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage (page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //如果filteredMovies裡面是有東西的，就給我filteredMovies。但是如果filteredMovies是空的，就給我movies
  const startIndex = (page - 1) * Movies_PER_PAGE
  const endIndex = startIndex + Movies_PER_PAGE
  return data.slice(startIndex, startIndex + endIndex)
}


function showMovieModal (id) {
  const modalTitle = document.querySelector ('#movie-modal-title')
  const modalImage = document.querySelector ('#movie-modal-image')
  const modalDate = document.querySelector ('#movie-modal-date')
  const modalDescription = document.querySelector ('#movie-modal-description') 

  axios.get (INDEX_URL + id ).then ((response) => {
    // <response class="data results">
    const data = response.data.results
    
    modalTitle.innerText= data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    
  })
}


function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

changeMode.addEventListener ('click', function onChangeModeClicked(event){
  if (event.target.matches('#cardMode')) {
    mode = 'card'
  } else if (event.target.matches('#listMode')) {
    mode = 'list'
  }
  displayDataList()
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener ('click',function onPaginatorClicked(event){
  if (event.target.tagName !== 'A') return
  nowPage = Number(event.target.dataset.page)
  renderMovieList (getMoviesByPage(page))
  displayDataList()
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event){
    event.preventDefault() 
    const keyword = searchInput.value.trim().toLowerCase()
    

    // if (!keyword.length) {
    //   return alert ('請輸入文字')
    // }

    filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))


    if (filteredMovies.length === 0) {
      return alert ('找不到任何相關電影：' + keyword)
    }
    // for (const movie of movies) {
    //   if (movie.title.toLowerCase().includes(keyword)){
    //     filteredMovies.push(movie)
    //   }
    // }
    renderPaginator (filteredMovies.length)
    nowPage = 1
    displayDataList()
  })

axios.get(INDEX_URL).then((response) => {
  // Array(80) 
  //array.push() 將資料放進陣列
  movies.push( ... response.data.results) // ... 三個點點是展開運算子，主要功用是「展開陣列元素」。
  renderPaginator (movies.length)
  displayDataList()
})


