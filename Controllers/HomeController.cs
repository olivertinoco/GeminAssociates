using Microsoft.AspNetCore.Mvc;
using General.Librerias.AccesoDatos;
using GeminAssociates.Models;
using System.Text.Json;
using System.Net.Http.Headers;

namespace GeminAssociates.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public HomeController(ILogger<HomeController> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Datos()
    {
        ViewBag.Rpta = TempData["data"];
        return View();
    }

    public string GrabarPostulante()
    {
        try
        {
            string rpta = "";
            string data = Request.Form["campos"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "Cnx");
            rpta = odaSQL.ejecutarComando("dbo.usp_saveDataPostulante", "@data", data);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    public async Task<string> DataInicio()
    {
        try
        {
            String rpta = "";
            String[] numero;
            string[] mensaje = { "existe", "error", "dni no valido", "sin datos", "Token" };
            string user = Request.Form["data1"].ToString();
            string clave = Request.Form["data2"].ToString();
            string data = $"{user}|{clave}";

            daSQL odaSQL = new daSQL(_configuration, "Cnx");
            rpta = odaSQL.ejecutarComando("dbo.usp_loginConvocatoria", "@data", data);
            if (mensaje.Contains(rpta))
            {
                return rpta;
            }
            else
            {
                numero = rpta.Split('¬');
                if (numero[0] == "")
                {
                    TempData["data"] = numero[1];
                    return "OK";
                }
                else
                {
                    string dni;
                    try
                    {
                        if (numero[0] != clave)
                        {
                            return "La clave debe ser igual al nro de DNI";
                        }
                        dni = await DniCallDataResponse(numero[0]);
                        if (mensaje.Any(m => dni.StartsWith(m)))
                        {
                            return dni;
                        }
                        TempData["data"] = $"2^{dni}{numero[1]}";
                        return "OK";
                    }
                    catch (Exception exDni)
                    {
                        _logger.LogError(exDni, "Error al consultar servicio");
                        TempData["data"] = $"1|{numero[0]}{numero[1]}";
                        return "OK";
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DataInicio");
            return "ERROR";
        }
    }

    private async Task<string> ConsultarDni(string numero)
    {
        try
        {
            string rpta = "";
            string? token = Environment.GetEnvironmentVariable("TOKEN");
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api.apis.net.pe/v2/reniec/dni?numero={numero}";

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var persona = JsonSerializer.Deserialize<ReniecResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (persona != null)
                {
                    rpta = $"{persona.TipoDocumento}|{persona.NumeroDocumento}|{persona.ApellidoPaterno}|{persona.ApellidoMaterno}|{persona.Nombres}";
                }
                else
                {
                    rpta = "sin datos";
                }
            }
            else
            {
                var error = JsonSerializer.Deserialize<ApiError>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                rpta = $"{error?.Message ?? "error desconocido"}";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Servicio");
            return $"error de conexión";
        }
    }

    private async Task<string> DniCallDataResponse(string numero)
    {
        try
        {
            string rpta = "";
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api-lamb-academic.upeu.edu.pe/resources/api/resources/searchdocument/dni?dni={numero}";

            var response = await client.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var persona = JsonSerializer.Deserialize<DniDataResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (persona?.Data != null)
                {
                    var d = persona.Data;
                    rpta = $"1|{d.Dni}|{d.ApPaterno}|{d.ApMaterno}|{d.Nombres}||{d.Sexo}|||{d.EstadoCivil}||{d.FechaNacimiento}||||||||||{d.Direccion}|{d.Ubigeo}|";
                }
                else
                {
                    rpta = "sin datos";
                }
            }
            else
            {
                var error = JsonSerializer.Deserialize<DniDataResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                rpta = $"{error?.Message ?? "error desconocido"}";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Servicio");
            return $"error de conexión";
        }
    }

    public async Task<string> SubirArchivo(string nombreArchivo, int viajeActual, string flgInicio = "0")
    {
        string rpta = "";
        try
        {
            string rutaCarpeta = _configuration.GetSection("AppSettings")["RutaArchivos"]
            ?? throw new InvalidOperationException("RutaArchivos no configurada.");
            if (flgInicio == "1" && !Directory.Exists(rutaCarpeta))
            {
                Directory.CreateDirectory(rutaCarpeta);
            }
            string rutaArchivo = Path.Combine(rutaCarpeta, nombreArchivo);
            if (viajeActual == 1 && System.IO.File.Exists(rutaArchivo))
            {
                System.IO.File.Delete(rutaArchivo);
            }
            if (Request.Body != null && Request.Body.CanRead)
            {
                byte[] buffer = new byte[8192]; // 8 KB por chunk
                int bytesLeidos;
                using var fs = new FileStream(rutaArchivo, FileMode.Append, FileAccess.Write, FileShare.None);
                while ((bytesLeidos = await Request.Body.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    await fs.WriteAsync(buffer, 0, bytesLeidos);
                }
                rpta = "ok";
            }
            else
            {
                _logger.LogWarning("Request.Body es nulo o no se puede leer.");
                rpta = "error: cuerpo no válido";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en SubirArchivo");
            return $"error de conexión";
        }
        return rpta;
    }

}
