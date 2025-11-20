/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ArkaCDNClient } from "@/lib/arka-cdn-client";
import { Database, Search, Edit, Loader2, X, CheckCircle2 } from "lucide-react";

interface EntityManagerProps {
  client: ArkaCDNClient;
  isAuthenticated: boolean;
}

export const EntityManager = ({
  client,
  isAuthenticated,
}: EntityManagerProps) => {
  const [queryFilters, setQueryFilters] = useState({
    type: "",
    fileName: "",
    withAttributes: true,
    withPayload: false,
    limit: 50,
  });
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingEntity, setEditingEntity] = useState<{
    key: string;
    data: any;
  } | null>(null);
  const [updateData, setUpdateData] = useState({
    title: "",
    content: "",
    description: "",
    expirationHours: 0,
    customData: "",
  });
  const [updating, setUpdating] = useState(false);

  const handleQuery = async () => {
    if (!isAuthenticated) {
      setError("Debes estar autenticado para consultar entidades");
      return;
    }

    setLoadingQuery(true);
    setError(null);

    try {
      const filters: any = {};
      if (queryFilters.type) filters.type = queryFilters.type;
      if (queryFilters.fileName) filters.fileName = queryFilters.fileName;
      filters.withAttributes = queryFilters.withAttributes;
      filters.withPayload = queryFilters.withPayload;
      filters.limit = queryFilters.limit;

      const response = await client.queryEntities(filters);
      setQueryResults(response.data || []);
    } catch (err: any) {
      setError(err.message || "Error al consultar entidades");
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity || !isAuthenticated) return;

    setUpdating(true);
    setError(null);

    try {
      const updatePayload: any = {};
      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.content) updatePayload.content = updateData.content;
      if (updateData.description)
        updatePayload.description = updateData.description;
      if (updateData.expirationHours > 0)
        updatePayload.expirationHours = updateData.expirationHours;
      if (updateData.customData) {
        try {
          updatePayload.customData = JSON.parse(updateData.customData);
        } catch {
          throw new Error("El customData debe ser un JSON válido");
        }
      }

      await client.updateEntity(editingEntity.key, updatePayload);
      setEditingEntity(null);
      setUpdateData({
        title: "",
        content: "",
        description: "",
        expirationHours: 0,
        customData: "",
      });
      await handleQuery();
    } catch (err: any) {
      setError(err.message || "Error al actualizar entidad");
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (entity: any) => {
    setEditingEntity({ key: entity.entityKey, data: entity });
    setUpdateData({
      title: entity.attributes?.title || "",
      content: entity.attributes?.content || "",
      description: entity.attributes?.description || "",
      expirationHours: entity.attributes?.expirationHours || 0,
      customData: entity.attributes?.customData
        ? JSON.stringify(entity.attributes.customData, null, 2)
        : "",
    });
  };

  return (
    <section id="entity-manager" className="pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-12 mb-8 shadow-2xl shadow-purple-900/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Gestión de Entidades en Arkiv Network
            </h3>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-300 text-lg">Debes estar autenticado</p>
              <p className="text-slate-400 text-sm mt-2">
                Inicia sesión para gestionar entidades en Arkiv Network
              </p>
            </div>
          ) : (
            <>
              {/* Formulario de consulta */}
              <div className="bg-purple-950/30 rounded-xl p-6 mb-6 border border-purple-700/30">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  Consultar Entidades
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      Tipo
                    </label>
                    <input
                      type="text"
                      value={queryFilters.type}
                      onChange={(e) =>
                        setQueryFilters({
                          ...queryFilters,
                          type: e.target.value,
                        })
                      }
                      placeholder="file, file-chunk, etc."
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      Nombre de archivo
                    </label>
                    <input
                      type="text"
                      value={queryFilters.fileName}
                      onChange={(e) =>
                        setQueryFilters({
                          ...queryFilters,
                          fileName: e.target.value,
                        })
                      }
                      placeholder="image.jpg"
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      Límite
                    </label>
                    <input
                      type="number"
                      value={queryFilters.limit}
                      onChange={(e) =>
                        setQueryFilters({
                          ...queryFilters,
                          limit: parseInt(e.target.value) || 50,
                        })
                      }
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-sm text-purple-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={queryFilters.withAttributes}
                        onChange={(e) =>
                          setQueryFilters({
                            ...queryFilters,
                            withAttributes: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      Con atributos
                    </label>
                    <label className="flex items-center gap-2 text-sm text-purple-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={queryFilters.withPayload}
                        onChange={(e) =>
                          setQueryFilters({
                            ...queryFilters,
                            withPayload: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      Con payload
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleQuery}
                  disabled={loadingQuery}
                  className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-700/30"
                >
                  {loadingQuery ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Consultar
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Resultados */}
              {queryResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">
                    Resultados ({queryResults.length})
                  </h4>
                  {queryResults.map((entity, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-900/10 border border-purple-700/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm mb-2">
                            Entity Key
                          </p>
                          <p className="text-purple-400 text-xs font-mono break-all">
                            {entity.entityKey}
                          </p>
                        </div>
                        <button
                          onClick={() => openEditModal(entity)}
                          className="cursor-pointer px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-900/50 transition-all flex items-center gap-2 border border-blue-700/50"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      </div>
                      {entity.attributes && (
                        <div className="space-y-2 pt-4 border-t border-purple-700/30">
                          <p className="text-sm text-purple-300 font-medium">
                            Atributos
                          </p>
                          <pre className="bg-purple-950/30 rounded-lg p-3 text-xs text-purple-200 font-mono overflow-x-auto">
                            {JSON.stringify(entity.attributes, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entity.payload && (
                        <div className="space-y-2 pt-4 border-t border-purple-700/30">
                          <p className="text-sm text-purple-300 font-medium">
                            Payload
                          </p>
                          <pre className="bg-purple-950/30 rounded-lg p-3 text-xs text-purple-200 font-mono overflow-x-auto">
                            {JSON.stringify(entity.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Modal de edición */}
              {editingEntity && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  onClick={() => setEditingEntity(null)}
                >
                  <div
                    className="bg-purple-950/50 border border-purple-600/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-6 border-b border-purple-700/30">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Edit className="w-5 h-5 text-purple-400" />
                        Actualizar Entidad
                      </h3>
                      <button
                        onClick={() => setEditingEntity(null)}
                        className="cursor-pointer text-purple-400/60 hover:text-purple-300 transition-colors p-2"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-purple-300 mb-2">
                            Entity Key
                          </label>
                          <p className="text-purple-400 text-sm font-mono break-all bg-purple-950/30 rounded-lg p-3">
                            {editingEntity.key}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm text-purple-300 mb-2">
                            Título
                          </label>
                          <input
                            type="text"
                            value={updateData.title}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-purple-300 mb-2">
                            Contenido
                          </label>
                          <textarea
                            value={updateData.content}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                content: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-purple-300 mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={updateData.description}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-purple-300 mb-2">
                            Horas de expiración (1-8760)
                          </label>
                          <input
                            type="number"
                            value={updateData.expirationHours}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                expirationHours: parseInt(e.target.value) || 0,
                              })
                            }
                            min="1"
                            max="8760"
                            className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-purple-300 mb-2">
                            Custom Data (JSON)
                          </label>
                          <textarea
                            value={updateData.customData}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                customData: e.target.value,
                              })
                            }
                            rows={6}
                            placeholder='{"key": "value"}'
                            className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-700/30">
                      <button
                        onClick={() => setEditingEntity(null)}
                        className="cursor-pointer px-6 py-2.5 text-purple-300 bg-purple-800/50 border border-purple-700/50 rounded-lg font-medium hover:bg-purple-800/70 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleUpdateEntity}
                        disabled={updating}
                        className="cursor-pointer px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {updating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Actualizar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
