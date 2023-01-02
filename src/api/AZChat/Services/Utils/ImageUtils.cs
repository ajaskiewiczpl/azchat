using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace AZChat.Services.Utils;

public class ImageUtils
{
    public static string ToBase64Png(byte[] data)
    {
        string base64 = Convert.ToBase64String(data);
        string result = $"data:image/png;base64,{base64}";
        return result;
    }

    public static async Task<Image> ResizeAsync(Stream stream, int width, int height, CancellationToken token)
    {
        Image img = await Image.LoadAsync(stream, token);

        if (token.IsCancellationRequested)
        {
            return img;
        }

        img.Mutate(x => x.Resize(new ResizeOptions()
        {
            Size = new Size(width, height),
            Mode = ResizeMode.Max
        }));
        
        return img;
    }
}