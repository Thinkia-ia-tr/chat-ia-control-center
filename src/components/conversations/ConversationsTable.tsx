import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Conversation } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare } from "lucide-react";

interface ConversationsTableProps {
  data: Conversation[];
  onRowClick: (row: { row: { original: Conversation } }) => void;
}

// Function to get user-friendly channel names
const getChannelDisplayName = (channel: string): string => {
  // Solo tenemos dos canales posibles: 'Web' y 'Whatsapp'
  if (channel === 'Whatsapp') return 'Whatsapp';
  return 'Web';
};

// Función para formatear correctamente valores de cliente según su tipo
const formatClientValue = (client: any): string => {
  if (!client) return "Sin cliente";
  
  // Si es un número directo (como viene de la base de datos)
  if (typeof client === 'number') {
    const clientStr = client.toString();
    // Si parece un teléfono (más de 9 dígitos), formatearlo
    if (clientStr.length >= 9) {
      return `+${clientStr}`;
    }
    return clientStr;
  }
  
  // Si es un objeto con type y value
  if (typeof client === 'object' && client.type && client.value) {
    const clientType = client.type;
    let clientValue = client.value;
    
    // Asegurar que el valor es un string
    if (typeof clientValue !== 'string') {
      clientValue = clientValue.toString();
    }
    
    // Para teléfonos, mantener el formato como viene
    if (clientType === 'phone') {
      return clientValue;
    } 
    else if (clientType === 'id') {
      return clientValue;
    }
    
    return clientValue;
  }
  
  // Si es un string directo
  if (typeof client === 'string') {
    return client;
  }
  
  // Para cualquier otro caso, convertir a string
  return client.toString();
};

// Function to shorten UUID for display while keeping full value in tooltip
const shortenUUID = (uuid: string): string => {
  if (!uuid || uuid.length < 36) return uuid;
  
  // For full UUID format (75bbf54a-110d-4b59-86f6-5f41baa0f17d)
  // Display first 8 chars and last 4 chars with ellipsis in between
  return `${uuid.substring(0, 8)}...${uuid.substring(32)}`;
};

export function ConversationsTable({ data, onRowClick }: ConversationsTableProps) {
  console.log("ConversationsTable render with data:", data);

  const columns = [
    {
      header: "Conversación",
      accessorKey: "title",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div className="w-full">
          <span className="block">{row.original.title || "Sin título"}</span>
        </div>
      )
    },
    {
      header: "Cliente",
      accessorKey: "client",
      cell: ({ row }: { row: { original: Conversation } }) => {
        const client = row.original.client;
        const formattedValue = formatClientValue(client);
        
        return (
          <div className="w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block cursor-help">
                    {client?.type === 'phone' ? formattedValue : shortenUUID(formattedValue)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-all">{formattedValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }
    },
    {
      header: "Canal",
      accessorKey: "channel",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div className="w-full">
          <Badge variant="default" className="bg-primary/70 hover:bg-primary/90">
            {getChannelDisplayName(row.original.channel || "Web")}
          </Badge>
        </div>
      )
    },
    {
      header: "Mensajes",
      accessorKey: "messages",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div className="w-full flex items-center justify-center text-center gap-1">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.messages || 0}</span>
        </div>
      )
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: ({ row }: { row: { original: Conversation } }) => {
        const date = row.original.date;
        let formattedDate = "Fecha desconocida";
        
        if (date) {
          try {
            formattedDate = format(new Date(date), "dd MMM yyyy HH:mm", { locale: es });
          } catch (error) {
            console.error("Error formatting date:", date, error);
          }
        }
        
        return (
          <div className="w-full">
            <span className="block text-right">{formattedDate}</span>
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      getRowId={(row) => row.id || Math.random().toString()}
    />
  );
}

export default ConversationsTable;
