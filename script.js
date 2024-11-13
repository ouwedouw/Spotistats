function processFiles() {
    const input = document.getElementById('fileInput');
    const files = input.files;

    if (files.length === 0) {
        alert('Please select files first.');
        return;
    }

    let combinedData = [];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonContent = JSON.parse(event.target.result);
                combinedData = combinedData.concat(jsonContent);
                filesProcessed++;

                if (filesProcessed === files.length) {
                    const processedData = manipulateJSON(combinedData);
                    console.log('Top 20 Songs:', processedData);
                }
            } catch (error) {
                console.error('Error parsing JSON from file', file.name, error);
                alert(`Invalid JSON file: ${file.name}`);
            }
        };

        reader.onerror = function() {
            alert('Error reading the file.');
        };

        reader.readAsText(file);
    });
}

function manipulateJSON(jsonData) {
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

    printTop20(top20Songs);
    return top20Songs;
}

function printTop20(top20Songs){
    const tracks = top20Songs;
    const trackList = document.getElementById('top20');

    tracks.forEach(track => {
        // Create a container for each track
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('track-item'); // Add a class for styling if needed

        // Create HTML content
        trackDiv.innerHTML = `
            <h3>${track.trackName} by ${track.artistName}</h3>
            <p>Total Played Time: ${track.formattedPlayTime}</p>
        `;

        // Append the element to the container
        trackList.appendChild(trackDiv);
    });
}