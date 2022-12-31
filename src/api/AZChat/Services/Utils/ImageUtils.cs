using System.Drawing;

namespace AZChat.Services.Utils;

public class ImageUtils
{
    public static string ToBase64Png(byte[] data)
    {
        string base64 = Convert.ToBase64String(data);
        string result = $"data:image/png;base64,{base64}";
        return result;
    }

    public static Image Resize(Image img, float maxDimensions)
    {
        if (img.Size.Width > maxDimensions || img.Size.Height > maxDimensions)
        {
            float scale = Math.Min(maxDimensions / img.Size.Width, maxDimensions / img.Size.Height);
            return new Bitmap(img, new Size((int)(img.Size.Width * scale), (int)(img.Size.Height * scale)));
        }
        else
        {
            return img;
        }
    }
}