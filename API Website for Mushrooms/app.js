const itemsDatabase = []
let jsonDataList = {}
const locations =[]
const favItems=[]
const locationLookUp = {}
const idlist = []


const getFavItemList = () => {

    if(localStorage.hasOwnProperty("favItemList") === true){

        JSON.parse(localStorage.getItem("favItemList")).forEach(id => {
            favItems.push(parseInt(id))
        })
        console.log(`favouriteItemList: ${favItems}`)
    }

}



const getItemList = async() => {
    try{
        const reponseFromAPI = await fetch("https://botw-compendium.herokuapp.com/api/v2/category/materials")
        const jsonData = await reponseFromAPI.json()

        jsonDataList = [...jsonData.data]

        for(let i = 0; i < jsonData.data.length; i++){

            idlist.push(`${jsonData.data[i].id}`)

            itemsDatabase.push({
                id: jsonData.data[i].id,
                name: `${jsonData.data[i].name}`,
                desc: `${jsonData.data[i].description}`,
                image: `${jsonData.data[i].image}`
            })
            for(let j = 0; j < jsonData.data[i].common_locations.length; j++){

                locations.push(`${jsonData.data[i].common_locations[j]}`)
            }    
        }
        console.log(locations)
        const uniqueLocation = [...new Set(locations)]
        for(let i = 0; i < uniqueLocation.length; i++){

            document.querySelector("#locations").innerHTML += `
            <option>${uniqueLocation[i]}</option>
            `
        }
        getLocationLookUp()
        getFavItemList()
        console.log(locationLookUp)
        console.log(uniqueLocation)
        console.log(idlist)

    }catch(error){
        console.log(`error : ${error}`)
    }
}


const displaySearchResults = (searchResultsArray) => {

    if(searchResultsArray.length === 0){

        document.querySelector("#returnData").innerHTML = "<p>No matching items found</p>"
    }else {

        document.querySelector("#returnData").innerHTML = ""
    
    for (let i = 0; i < searchResultsArray.length; i++){
        
        const currItem = searchResultsArray[i]
        document.querySelector("#returnData").innerHTML += `

            <div class="dataCard">
                <img class="image" src="${currItem.image}"/>
                <div item-id="${currItem.id}">
                    <div class = "labelContainer">
                        <p id="name">${currItem.name}</p>
                        <p class = "favLabel" id="${currItem.id}"></p>
                    </div>
                    <p id="description">${currItem.desc}</p>
                </div> 
            </div>
            `  
        }
        setFavLabel(idlist)
    }
}

const setFavLabel = (idList) => {

    console.log("setFavouriteLabel()")

    
    
    for( let i = 0; i < idList.length; i++){

        const favId = favItems[i].toString()

        if(favItems.includes(parseInt(idList[i]))){

            console.log("Adding favorite label for item id: "+idList[i])

            document.getElementById(favId).innerHTML = "Favorited"
        }
    }
}


const searchPressed = () => {

    const searchedText = document.querySelector("input").value
    document.querySelector("#locations").options[0].selected = true
    const searchResults = []

    for(let i = 0; i < itemsDatabase.length; i++){
        if(itemsDatabase[i].name.includes(searchedText) === true) {
            console.log(`name : ${itemsDatabase[i].name}`)
            searchResults.push(itemsDatabase[i])
        }
    }

    displaySearchResults(searchResults)   
    
}

const getLocationLookUp = () => {

    for (let i = 0; i < jsonDataList.length; i++){

        jsonDataList[i].common_locations.forEach((location) => {
          
            if(Object.getOwnPropertyNames(locationLookUp).includes(location)){
               
                locationLookUp[location].push(jsonDataList[i].id)

            } else{
                locationLookUp[location] = [jsonDataList[i].id]
            }
        })
        
    }

    console.log(`final LocationsLookUp: ${JSON.stringify(locationLookUp)}`)
}

const filterSelected = (evt) => {
    
    console.log("filterByLocation()")
    const filterLocationList = []

    document.querySelector("#searchBox").value = ""

    let selectedLocation = evt.target.value
    console.log(evt.target)
    console.log(`selectedLocation: ${selectedLocation}`)

    let itemsList = []

    if(selectedLocation !== "None"){

        itemsList = locationLookUp[selectedLocation]
        console.log(`itemsListAvailable: ${itemsList}`)
    }

    for(let i = 0; i < itemsDatabase.length; i++){

        for(let j = 0; j < itemsList.length; j++){

            if(itemsDatabase[i].id === parseInt(itemsList[j])) {
            
                filterLocationList.push(itemsDatabase[i])
            }
        }   
    }

    displaySearchResults(filterLocationList)
}


const addToFavourite = (evt) => {

    if(evt.path.length > 6){

        const itemClicked = evt.target.parentElement
        const clickedItemId = itemClicked.getAttribute("item-id")

        favItems.push(parseInt(clickedItemId))
        console.log(favItems)
        localStorage.setItem("favItemList", JSON.stringify(favItems))

        setFavLabel(idlist)    
    }  
    
}


document.addEventListener("DOMContentLoaded", getItemList)
document.querySelector("button").addEventListener("click", searchPressed)
document.querySelector("#locations").addEventListener("change",filterSelected)
document.querySelector("#returnData").addEventListener("click", addToFavourite)

