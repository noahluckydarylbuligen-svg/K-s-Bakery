$port = 8080
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
try {
    $listener.Start()
    Write-Host "K's Bakery Server successfully listening on 0.0.0.0:$port!"
    Write-Host "Local PC Access: http://localhost:$port/"
    Write-Host "Mobile Phone Access: http://10.34.168.138:$port/"
} catch {
    Write-Host "Error starting listener: $_"
    exit
}

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()
        
        if ($requestLine) {
            $parts = $requestLine.Split(' ')
            if ($parts.Length -ge 2) {
                $rawPath = $parts[1].Split('?')[0]
                if ($rawPath -eq "/") { $rawPath = "/index.html" }
                
                $decodedPath = [System.Uri]::UnescapeDataString($rawPath).TrimStart('/')
                $filePath = Join-Path "c:\Users\User\Project\K's Bakery" $decodedPath
                
                if (Test-Path $filePath -PathType Leaf) {
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $mime = "text/html; charset=utf-8"
                    switch ($ext) {
                        ".css"  { $mime = "text/css" }
                        ".js"   { $mime = "text/javascript" }
                        ".jpg"  { $mime = "image/jpeg" }
                        ".png"  { $mime = "image/png" }
                        ".svg"  { $mime = "image/svg+xml" }
                    }
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                } else {
                    $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
                    $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                    $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                }
            }
        }
        $stream.Close()
        $client.Close()
    } catch {
        # continue handling requests
    }
}
