
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useProductMentions, ProductMention } from "@/hooks/useProductMentions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, ExternalLink, MessageSquare, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ProductMentionsListProps {
  startDate?: Date;
  endDate?: Date;
}

export function ProductMentionsList({ startDate, endDate }: ProductMentionsListProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: mentions, isLoading, isError } = useProductMentions(startDate, endDate);

  if (isError) {
    toast({
      title: "Error",
      description: "No se pudieron cargar las menciones de productos",
      variant: "destructive"
    });
  }

  const columns = [
    {
      header: "Producto",
      accessorKey: "product_name",
      cell: ({ row }: { row: { original: ProductMention } }) => (
        <div className="flex items-center w-[95%]">
          <Badge 
            variant="default"
            className="flex items-center gap-1.5 py-1 px-2 font-medium bg-primary/70 hover:bg-primary/90 text-primary-foreground"
          >
            <Tag className="h-3.5 w-3.5" />
            {row.original.product_name}
          </Badge>
        </div>
      ),
      className: "w-[25%]",
    },
    {
      header: "Contexto",
      accessorKey: "context",
      cell: ({ row }: { row: { original: ProductMention } }) => (
        <div className="w-full pr-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate cursor-help block text-sm text-muted-foreground">
                  {row.original.context || "Sin contexto disponible"}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="whitespace-pre-wrap">{row.original.context || "Sin contexto disponible"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      className: "w-[35%]",
    },
    {
      header: "Conversación",
      accessorKey: "conversation_title",
      cell: ({ row }: { row: { original: ProductMention } }) => (
        <div className="flex items-center gap-2 w-full pr-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate cursor-help flex-grow text-sm">{row.original.conversation_title}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.original.conversation_title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/conversaciones/${row.original.conversation_id}`);
            }}
            className="h-6 w-6 flex-shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-[25%]",
    },
    {
      header: "Fecha",
      accessorKey: "created_at",
      cell: ({ row }: { row: { original: ProductMention } }) => (
        <div className="text-right">
          <div className="text-sm font-medium">
            {format(new Date(row.original.created_at), "dd MMM yyyy", { locale: es })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(row.original.created_at), "HH:mm", { locale: es })}
          </div>
        </div>
      ),
      className: "w-[15%] text-right",
    },
  ];

  const handleRowClick = (data: { row: { original: ProductMention } }) => {
    navigate(`/conversaciones/${data.row.original.conversation_id}`);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Cargando menciones de productos...</span>
        </div>
      ) : mentions && mentions.length > 0 ? (
        <DataTable
          columns={columns}
          data={mentions}
          onRowClick={handleRowClick}
          getRowId={(row) => row.id}
        />
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/20">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
          <p className="mt-2 text-lg font-medium">No hay menciones de productos</p>
          <p className="text-sm text-muted-foreground">
            No se han detectado menciones de productos en el período seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}
