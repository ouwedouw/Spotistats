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
                        processJSON(combinedData);
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

function processJSON(jsonData) {
    const artistTotals = {};
    const songTotals = {};
    let totalTime = 0;

    jsonData.forEach(item => {
        const trackName = item.trackName || item.master_metadata_track_name;
        const artistName = item.artistName || item.master_metadata_album_artist_name;
        const msPlayed = item.msPlayed || item.ms_played;

        if (trackName === null || artistName === null || msPlayed === undefined) {
            return; // Skip this song
        }

        const artistKey = `${artistName}`;
        const songKey = `${artistName} - ${trackName}`;

        if (artistTotals[artistKey]) {
            artistTotals[artistKey].totalMsPlayed += msPlayed;
        } else {
            artistTotals[artistKey] = {
                artistName: artistName,
                totalMsPlayed: msPlayed
            };
        }

        if (songTotals[songKey]) {
            songTotals[songKey].totalMsPlayed += msPlayed;
        } else {
            songTotals[songKey] = {
                artistName: artistName,
                trackName: trackName,
                totalMsPlayed: msPlayed
            };
        }

        totalTime += msPlayed;
    });

    const sortedArtists = Object.values(artistTotals).sort((a, b) => {
        return b.totalMsPlayed - a.totalMsPlayed;
    });

    const sortedSongs = Object.values(songTotals).sort((a, b) => {
        return b.totalMsPlayed - a.totalMsPlayed;
    });

    const top20Songs = sortedSongs.slice(0, 20);
    const top20Artists = sortedArtists.slice(0, 20);

    top20Artists.forEach(artist => {
        const minutes = Math.floor(artist.totalMsPlayed / 60000);
        const seconds = Math.floor((artist.totalMsPlayed % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        artist.formattedPlayTime = formattedTime;
    });

    top20Songs.forEach(song => {
        const minutes = Math.floor(song.totalMsPlayed / 60000);
        const seconds = Math.floor((song.totalMsPlayed % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        song.formattedPlayTime = formattedTime; // Add formatted playtime to each song
    });

    const totminutes = Math.floor(totalTime / 60000);
    const totseconds = Math.floor((totalTime % 60000) / 1000);
    const totformattedTime = `${totminutes}:${totseconds.toString().padStart(2, '0')}`;

    timeDiv = document.getElementById("totalTime");
    timeDiv.innerHTML = "Total time listened: " + totformattedTime;

    top20SongPrint(top20Songs);
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