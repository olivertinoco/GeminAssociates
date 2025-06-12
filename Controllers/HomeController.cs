using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using General.Librerias.AccesoDatos;
using GeminAssociates.Models;
using System.Text.Json;
using System.Net.Http.Headers;
using System.Threading.Tasks;

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

    public async Task<string> DataInicio()
    {
        try
        {
            String rpta = "";
            String[] numero;
            string[] mensaje = {"existe", "error", "dni no valido"};
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
                        dni = await ConsultarDni(numero[0]);
                        if (mensaje.Contains(dni))
                        {
                            return dni;
                        }
                        TempData["data"] = $"{dni}{numero[1]}";
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
    

}
