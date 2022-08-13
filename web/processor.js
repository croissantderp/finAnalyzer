document.addEventListener('DOMContentLoaded', function () { initiate(); });

var begin;
var finalString = "";

function initiate() {
    begin = document.getElementById("begin");

    begin.addEventListener("click", function () {

        const selectedFiles = document.getElementById('input').files;

        document.getElementById("results").innerHTML = "";
        finalString = "filename,light pixels,light pixel percent,dark pixels,dark pixel percent<br />";

        var count = selectedFiles.length;
        var currentCount = 0;

        Array.from(selectedFiles).forEach(function (selectedFile) {

            var reader = new FileReader();

            reader.readAsArrayBuffer(selectedFile);

            reader.onload = async function () {
                var image = await IJS.Image.load(reader.result);

                var width = image.width;
                var height = image.height;

                var threshold = 0;
                var counter = 0;

                var light = 0;
                var dark = 0;

                for (var i = 0; i < width; i++) {
                    for (var j = 0; j < height; j++) {
                        var color = image.getPixelXY(i, j);
                        if ((color[0] < 10 && color[1] > 245 && color[2] < 10) || color[3] <= 5) {
                            continue;
                        }

                        threshold += (color[0] + color[1] + color[2]) / 3.0;
                        counter++;
                    }
                }

                threshold /= counter;

                console.log(threshold);

                for (var i = 0; i < width; i++) {
                    for (var j = 0; j < height; j++) {
                        var color = image.getPixelXY(i, j);

                        if ((color[0] < 10 && color[1] > 245 && color[2] < 10) || color[3] <= 5) {
                            continue;
                        }

                        if ((color[0] + color[1] + color[2]) / 3.0 > threshold) {
                            light++;
                        }
                        else {
                            dark++;
                        }
                    }
                }

                var total = light + dark;

                var percentL = light / total * 100;
                var percentD = dark / total * 100;

                console.log("light colored pixels: " + light + ", " + percentL + "% \ndark colored pixel: " + dark + ", " + percentD + "%");
                finalString += selectedFile.name + "," + light + "," + percentL + "," + dark + ", " + percentD + "<br />";

                currentCount++;
                if (currentCount == count) {
                    end();
                }
            }
        });
    });
}

function end() {
    document.getElementById("results").innerHTML = finalString;
    download(finalString.replaceAll("<br />", "\n"), "output.csv", "text/plain");
}

//from https://stackoverflow.com/questions/13405129/create-and-save-a-file-with-javascript
// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}