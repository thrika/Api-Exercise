const fs = require('fs')
const axios = require('axios')
require('dotenv').config()

writeToFile();

// Reads the encrypted file and groups it into batches
function readSecretFile(){

    const fileArray = fs.readFileSync('super-secret-data.txt').toString().split("\n");
    let batch_size = 950;
    const batchFileArray = [];

    for(let startPoint=0; startPoint<fileArray.length; startPoint+= batch_size) {
        batchFileArray.push(fileArray.slice(startPoint, startPoint+batch_size));
    }
    return batchFileArray
}

function decryptSecretFile(){

    const batchFileArray = readSecretFile();
    let citizenData = []
    let promises = []

    for (const batch of batchFileArray) {
        promises.push(axios({
                method: 'post',
                url: 'https://txje3ik1cb.execute-api.us-east-1.amazonaws.com/prod/decrypt',
                data: batch,
                headers: {
                    "x-api-key": process.env.X_API_KEY
                }
            })
                .then(res => {
                    citizenData = citizenData.concat(res.data)
                    console.log(citizenData.length)
                })
                .catch(err => console.log(err.status))
        )
    }
    return Promise.all(promises)
        .then(() => { return citizenData })
        .catch(err => console.log(err));
        
}

// Removes duplicate data based on name
function cleanData() {

    return decryptSecretFile().then(citizenData => {

        let objectArray = []

        citizenData.forEach(citizen => objectArray.push(JSON.parse(citizen)));

        uniqueCitizens = objectArray.filter((value, index, self) =>
            index === self.findIndex((uniqueCitizen) => (
                uniqueCitizen.name === value.name
            ))
        )
        return uniqueCitizens
    })
    .catch(err => console.log(err));

}

//Checks if api exists and groups citizens based on homeworld
async function groupCitizens(){

    try {

        let test_url = 'https://swapi.dev/api/';
        await axios.get(test_url);

        return cleanData().then(uniqueCitizens => {

            let citizenPlanetPair = []
            let promises = []
    
            for (const citizen of uniqueCitizens) {
    
                homeworld_url = citizen.homeworld.replace(".co", ".dev");
    
                promises.push(
                    axios.get(homeworld_url)
                    .then(res => {
                        let citizePlanetObject = {"name": citizen.name, "homeworld": res.data.name}
                        citizenPlanetPair.push(citizePlanetObject)
                    })
                    .catch(err => console.log(err.status))
                )
            }
            return Promise.all(promises).then(() => {
    
                let grouped = []
    
                citizenPlanetPair.forEach(pair => {
                        if(!grouped[pair.homeworld]){ 
                            grouped[pair.homeworld] = []; 
                        }
                        grouped[pair.homeworld].push(pair.name); 
                    }   
                ); 
                return grouped;
            });
        });
    }
    catch (err) {

        return cleanData().then(uniqueCitizens => {

            let grouped = []

            uniqueCitizens.forEach(pair => {
                    if( !grouped[pair.homeworld] ){ 
                        grouped[pair.homeworld] = []; 
                    } 
                    grouped[pair.homeworld].push(pair.name);
                }   
            );
            return grouped;
        })
        .catch(err => console.log(err));
    }
}

function writeToFile(){
    groupCitizens().then(groupedCitizens => {

        let file = fs.createWriteStream('citizens-super-secret-info.txt');

        file.on('error', err => console.log(err));
    
        for (groupedCitizen in groupedCitizens) {
            file.write(groupedCitizen + '\n');
            for (citizen of groupedCitizens[groupedCitizen]) {
                file.write('- ' + citizen + '\n');
            }
        }
        file.end();
    })
    .catch(err => console.log(err));
}
