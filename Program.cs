using System;
using System.Text;
using System.Linq;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

Console.WriteLine("Please enter a path");

while (true)
{

    Console.Write(">");

    string? path = Console.ReadLine();

    if (path == null)
    {
        Console.WriteLine("Please enter a path");
        continue;
    }
    else if (!Directory.Exists(path))
    {
        Console.WriteLine("Directory does not exist");
        continue;
    }

    Console.WriteLine("Output images? (y/n default: n)");

    Console.Write(">");

    string? output = Console.ReadLine();
    string? outputPath = "";

    if (output == null || (!output.Contains("y") && !output.Contains("Y")))
    {
        output = "n";
    }

    Console.WriteLine("Enter path to directory to output data" + (output != "n" ? " and images" : ""));

    Console.Write(">");

    outputPath = Console.ReadLine();

    if (outputPath == null)
    {
        Console.WriteLine("Please enter a path");
        continue;
    }
    else if (!Directory.Exists(outputPath))
    {
        Console.WriteLine("Directory does not exist");
        continue;
    }

    string text = "filename,light pixels,light pixels percent,dark pixels,dark pixel percent\n";
    string[] files = Directory.GetFiles(path);

    int len = files.Length;

    for (int cur = 0; cur < len; cur++)
    {
        int darkPixels = 0, lightPixels = 0;

        Console.WriteLine(files[cur]);
        Image image = Image.FromFile(files[cur]);
        Bitmap bitmap = new Bitmap(image);

        int height = image.Height;
        int width = image.Width;

        Bitmap testOutput1 = new Bitmap(width, height);
        Bitmap testOutput2 = new Bitmap(width, height);

        double threshold = 0;
        int totalCounter = 0;

        for (int i = 0; i < width; i++)
        {
            for (int j = 0; j < height; j++)
            {
                Color c = bitmap.GetPixel(i, j);

                if ((c.R < 10 && c.G > 245 && c.B < 10) || c.A == 0)
                {
                    continue;
                }

                //adds grayscale value to average
                threshold += (c.R + c.G + c.B) / 3.0;
                totalCounter++;
            }
        }

        //calculates average
        threshold /= totalCounter;
        Console.WriteLine(threshold);

        for (int i = 0; i < width; i++)
        {
            for (int j = 0; j < height; j++)
            {
                Color c = bitmap.GetPixel(i, j);
                if ((c.R < 10 && c.G > 245 && c.B < 10) || c.A == 0)
                {
                    continue;
                }

                //if pixel is light
                if ((c.R + c.G + c.B) / 3 > threshold)
                {
                    lightPixels++;
                    testOutput1.SetPixel(i, j, c);
                }
                //if pixel is dark
                else
                {
                    darkPixels++;
                    testOutput2.SetPixel(i, j, c);
                }
            }
        }

        string name = files[cur].Split(@"\").Last().Split(@"/").Last();

        float totalPixels = lightPixels + darkPixels;

        float percentL = (float)lightPixels / totalPixels * 100;

        float percentD = (float)darkPixels / totalPixels * 100;

        Console.WriteLine($"light colored pixels: {lightPixels} {percentL}% \ndark colored pixel: {darkPixels} {percentD}% \n");

        text += name + "," + lightPixels + "," + percentL + "," + darkPixels + "," + percentD + "\n";

        if (output != "n")
        {
            testOutput1.Save(@$"{outputPath}\{name}-1.png", ImageFormat.Png);
            testOutput2.Save(@$"{outputPath}\{name}-2.png", ImageFormat.Png);
        }

        image.Dispose();
        bitmap.Dispose();
        testOutput1.Dispose();
        testOutput2.Dispose();
    }

    try
    {
        File.WriteAllText(outputPath + @"\output.csv", text);
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex + "\n");
        Console.WriteLine("check if this output file is open in any application");
    }
}