$port = 8080
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)

try {
    $listener.Start()
    Write-Host "K's Bakery High-Speed Web Server listening on 0.0.0.0:$port!"
    Write-Host "Local PC Access: http://localhost:$port/"
    Write-Host "Mobile Phone Access: http://10.34.168.138:$port/"
} catch {
    Write-Host "Error starting listener: $_"
    exit
}

$root = "c:\Users\User\Project\K's Bakery"

while ($true) {
    try {
        if ($listener.Pending()) {
            $client = $listener.AcceptTcpClient()
            $client.ReceiveTimeout = 1500
            $client.SendTimeout = 1500
            $stream = $client.GetStream()
            
            $buffer = New-Object byte[] 4096
            $bytesRead = 0
            
            if ($stream.CanRead) {
                # Read initial HTTP request header
                $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
            }
            
            if ($bytesRead -gt 0) {
                $requestString = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
                $firstLine = $requestString.Split("`n")[0].Trim()
                $parts = $firstLine.Split(' ')
                
                if ($parts.Length -ge 2) {
                    $rawPath = $parts[1].Split('?')[0]
                    if ($rawPath -eq "/") { $rawPath = "/index.html" }
                    
                    $decodedPath = [System.Uri]::UnescapeDataString($rawPath).TrimStart('/')
                    $filePath = Join-Path $root $decodedPath
                    
                    if (Test-Path $filePath -PathType Leaf) {
                        $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $mime = "text/html; charset=utf-8"
                        switch ($ext) {
                            ".css"  { $mime = "text/css" }
                            ".js"   { $mime = "text/javascript" }
                            ".jpg"  { $mime = "image/jpeg" }
                            ".png"  { $mime = "image/png" }
                            ".svg"  { $mime = "image/svg+xml" }
                        }
                        $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($fileBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($fileBytes, 0, $fileBytes.Length)
                    } else {
                        $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
                        $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                        $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                    }
                }
            }
            $stream.Close()
            $client.Close()
        } else {
            Start-Sleep -Milliseconds 15
        }
    } catch {
        # Continue loop cleanly
    }
}
