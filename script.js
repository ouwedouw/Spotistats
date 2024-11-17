function processFiles() {
    const input = document.getElementById('fileInput');
    const files = input.files;

    if (files.length === 0) {
        alert('Please select files first.');
        return;
    }

    let combinedData = [];
    let filesProcessed = 0;

    // Gebruik Array.from() om de FileList naar een array om te zetten
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                // Probeer het JSON-bestand te parsen
                const jsonContent = JSON.parse(event.target.result);
                
                // Controleer of het een array of object is, en voeg correct toe
                if (Array.isArray(jsonContent)) {
                    combinedData = combinedData.concat(jsonContent);
                } else if (typeof jsonContent === 'object' && jsonContent !== null) {
                    combinedData.push(jsonContent);
                } else {
                    throw new Error('Unexpected JSON structure');
                }

                filesProcessed++;

                // Zodra alle bestanden verwerkt zijn, voer de bewerkingen uit
                if (filesProcessed === files.length) {
                    try {
                        JSONSongs(combinedData);
                        JSONArtists(combinedData);
                        totalTime(combinedData);
                    } catch (processingError) {
                        console.error('Error processing the combined JSON data:', processingError);
                        alert('Error processing combined data.');
                    }
                }
            } catch (error) {
                console.error('Error parsing JSON from file', file.name, error);
                alert(`Invalid JSON file: ${file.name}`);
            }
        };

        reader.onerror = function() {
            console.error('Error reading the file:', file.name);
            alert(`Error reading the file: ${file.name}`);
        };

        reader.readAsText(file);
    });
}

function JSONSongs(jsonData) {
    const songTotals = {};

    jsonData.forEach(item => {
        const trackName = item.trackName || item.master_metadata_track_name;
        const artistName = item.artistName || item.master_metadata_album_artist_name;
        const msPlayed = item.msPlayed || item.ms_played;

        if (trackName === null || artistName === null) {
            return; // Skip this song
        }

        const songKey = `${artistName} - ${trackName}`;

        if (songTotals[songKey]) {
            songTotals[songKey].totalMsPlayed += msPlayed;
        } else {
            songTotals[songKey] = {
                artistName: artistName,
                trackName: trackName,
                totalMsPlayed: msPlayed
            };
        }
    });

    // Sort the songs by totalMsPlayed in descending order
    const sortedSongs = Object.values(songTotals).sort((a, b) => {
        return b.totalMsPlayed - a.totalMsPlayed;
    });

    // Limit to the top 20 songs
    const top20Songs = sortedSongs.slice(0, 20);

    // Convert msPlayed to minutes:seconds for each song
    top20Songs.forEach(song => {
        const minutes = Math.floor(song.totalMsPlayed / 60000);
        const seconds = Math.floor((song.totalMsPlayed % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        song.formattedPlayTime = formattedTime; // Add formatted playtime to each song
    });

    top20SongPrint(top20Songs);
}

function totalTime(jsonData) {
    let totalTime = 0;

    jsonData.forEach(item => {
        const trackName = item.trackName || item.master_metadata_track_name;
        const artistName = item.artistName || item.master_metadata_album_artist_name;
        let msPlayed = item.msPlayed || item.ms_played;

        if (trackName === null || artistName === null || msPlayed === undefined) {
            return; // Skip this song
        }

        totalTime += msPlayed;
    });

    // Convert msPlayed to minutes:seconds for each song
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    console.log(formattedTime);
    timeDiv = document.getElementById("totalTime");
    timeDiv.innerHTML = "Total time listened: " + formattedTime;
}

function JSONArtists(jsonData) {
    const artistTotals = {};

    jsonData.forEach(item => {
        const artistName = item.artistName || item.master_metadata_album_artist_name;
        const msPlayed = item.msPlayed || item.ms_played;

        if (typeof msPlayed !== 'number' || isNaN(msPlayed) || msPlayed < 0) {
            return;
        }        

        if (artistName === null) {
            return; // Skip this song
        }

        const artistKey = `${artistName}`;

        if (artistTotals[artistKey]) {
            artistTotals[artistKey].totalMsPlayed += msPlayed;
        } else {
            artistTotals[artistKey] = {
                artistName: artistName,
                totalMsPlayed: msPlayed
            };
        }
    });

    const sortedArtists = Object.values(artistTotals).sort((a, b) => {
        return b.totalMsPlayed - a.totalMsPlayed;
    });

    const top20Artists = sortedArtists.slice(0, 20);

    top20Artists.forEach(artist => {
        const minutes = Math.floor(artist.totalMsPlayed / 60000);
        const seconds = Math.floor((artist.totalMsPlayed % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        artist.formattedPlayTime = formattedTime;
    });

    top20ArtistPrint(top20Artists);
}

function top20SongPrint(top20Songs){
    const tracks = top20Songs;
    const trackList = document.getElementById('top20Songs');

    tracks.forEach(track => {
        // Create a container for each track
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('track-item'); // Add a class for styling if needed

        // Create HTML content
        trackDiv.innerHTML = `
            <div id="title">${track.trackName}</div>
            <p>${track.artistName}</p>
            <p>Total Played Time: ${track.formattedPlayTime}</p>
        `;

        // Append the element to the container
        trackList.appendChild(trackDiv);
    });
}

function top20ArtistPrint(top20Artists){
    const artists = top20Artists;
    const artistList = document.getElementById('top20Artists');

    artists.forEach(artist => {
        // Create a container for each track
        const artistDiv = document.createElement('div');
        artistDiv.classList.add('artist-item'); // Add a class for styling if needed

        // Create HTML content
        artistDiv.innerHTML = `
            <div id="title">${artist.artistName}</div>
            <p>Total Played Time: ${artist.formattedPlayTime}</p>
        `;

        // Append the element to the container
        artistList.appendChild(artistDiv);
    });
}