document.addEventListener('DOMContentLoaded', function () { initiate(); });

var begin;

function initiate() {
    begin = document.getElementById("begin");

    begin.addEventListener("click", function () {

        const selectedFiles = document.getElementById('input').files;

        document.getElementById("results").innerHTML = "";
        var finalString = "";
        
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
                document.getElementById("results").innerHTML += selectedFile.name + "<br />light colored pixels: " + light + ", " + percentL + "% <br />dark colored pixel: " + dark + ", " + percentD + "%<br /><br />";
            }
        });
    });
}



