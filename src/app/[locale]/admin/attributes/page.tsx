'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { toApiLocale } from '@/lib/locales';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  Loader2, ListTree,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValueItem {
  id: number;
  attributeId: number;
  sortOrder: number;
  name: string;
}

interface AttrItem {
  id: number;
  attributeGroupId: number;
  sortOrder: number;
  name: string;
  values: ValueItem[];
}

interface GroupItem {
  id: number;
  sortOrder: number;
  name: string;
  attributes: AttrItem[];
}

type ModalMode = 'group' | 'attribute' | 'value' | null;
type ModalAction = 'create' | 'edit';

export default function AdminAttributesPage() {
  const locale = useLocale();
  const apiLocale = toApiLocale(locale);

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedAttrs, setExpandedAttrs] = useState<Set<number>>(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalAction, setModalAction] = useState<ModalAction>('create');
  const [editingItem, setEditingItem] = useState<GroupItem | AttrItem | ValueItem | null>(null);
  const [parentGroupId, setParentGroupId] = useState<number | null>(null);
  const [parentAttrId, setParentAttrId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.attributes.list(apiLocale);
      setGroups(data as GroupItem[]);
      setError(null);
    } catch {
      setError('加载属性失败');
    } finally {
      setLoading(false);
    }
  }, [apiLocale]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleAttr = (id: number) => {
    setExpandedAttrs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  // ── Modal ──
  const openCreateGroup = () => {
    setModalMode('group'); setModalAction('create');
    setEditingItem(null); setFormName(''); setShowModal(true);
  };

  const openCreateAttribute = (groupId: number) => {
    setModalMode('attribute'); setModalAction('create');
    setParentGroupId(groupId); setEditingItem(null); setFormName(''); setShowModal(true);
  };

  const openCreateValue = (attrId: number) => {
    setModalMode('value'); setModalAction('create');
    setParentAttrId(attrId); setEditingItem(null); setFormName(''); setShowModal(true);
  };

  const openEdit = (item: GroupItem | AttrItem | ValueItem, mode: ModalMode) => {
    setModalMode(mode); setModalAction('edit');
    setEditingItem(item); setFormName(item.name || ''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const descriptions = { zh_cn: { name: formName.trim() }, en: { name: formName.trim() } };

      if (modalAction === 'create') {
        switch (modalMode) {
          case 'group':
            await api.attributes.create('group', { descriptions });
            break;
          case 'attribute':
            await api.attributes.create('attribute', { attributeGroupId: parentGroupId ?? undefined, descriptions });
            break;
          case 'value':
            await api.attributes.create('value', { attributeId: parentAttrId ?? undefined, descriptions });
            break;
        }
      } else {
        const id = editingItem!.id;
        switch (modalMode) {
          case 'group':
            await api.attributes.update('group', id, { descriptions });
            break;
          case 'attribute':
            await api.attributes.update('attribute', id, { descriptions });
            break;
          case 'value':
            await api.attributes.update('value', id, { descriptions });
            break;
        }
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('确认删除？删除后不可恢复。')) return;
    try {
      await api.attributes.delete(type, id);
      await loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ListTree className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">属性管理</h1>
            <span className="text-gray-400">({groups.length} 组)</span>
          </div>
          <Button onClick={openCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />新增属性组
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
            <Button variant="outline" size="sm" className="ml-4" onClick={loadData}>重试</Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && groups.length === 0 && (
          <div className="text-center py-20">
            <ListTree className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无属性组，点击上方按钮创建</p>
          </div>
        )}

        {/* Groups */}
        {!loading && groups.length > 0 && (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className="overflow-hidden border-0 shadow-sm">
                {/* Group Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-900">{group.name}</span>
                    <Badge variant="secondary" className="rounded-full">
                      {group.attributes.length} 属性
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost" size="sm"
                      onClick={(e) => { e.stopPropagation(); openCreateAttribute(group.id); }}
                    >
                      <Plus className="h-4 w-4 mr-1" />属性
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={(e) => { e.stopPropagation(); openEdit(group, 'group'); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete('group', group.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Attributes */}
                {expandedGroups.has(group.id) && (
                  <CardContent className="px-6 pb-4 pt-0 bg-gray-50/50">
                    {group.attributes.length === 0 && (
                      <p className="text-gray-400 text-sm py-4 text-center">暂无属性，点击&quot;+属性&quot;添加</p>
                    )}
                    {group.attributes.map((attr) => (
                      <div key={attr.id} className="border-b border-gray-100 last:border-0">
                        {/* Attribute Header */}
                        <div
                          className="flex items-center justify-between py-3 pl-6 cursor-pointer hover:bg-white/50 transition-colors rounded-lg"
                          onClick={() => toggleAttr(attr.id)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedAttrs.has(attr.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-800">{attr.name}</span>
                            <Badge variant="outline" className="rounded-full text-xs">
                              {attr.values.length} 值
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost" size="sm"
                              onClick={(e) => { e.stopPropagation(); openCreateValue(attr.id); }}
                            >
                              <Plus className="h-3 w-3 mr-1" />值
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={(e) => { e.stopPropagation(); openEdit(attr, 'attribute'); }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDelete('attribute', attr.id); }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {/* Values */}
                        {expandedAttrs.has(attr.id) && (
                          <div className="pl-12 pb-3 flex flex-wrap gap-2">
                            {attr.values.length === 0 && (
                              <span className="text-xs text-gray-400 py-1">暂无属性值</span>
                            )}
                            {attr.values.map((val) => (
                              <div
                                key={val.id}
                                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm group hover:border-blue-200 transition-colors"
                              >
                                <span className="text-gray-700">{val.name}</span>
                                <button
                                  onClick={() => openEdit(val, 'value')}
                                  className="text-gray-300 hover:text-blue-500 transition-colors"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete('value', val.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'create' ? '新增' : '编辑'}
              {modalMode === 'group' ? '属性组' : modalMode === 'attribute' ? '属性' : '属性值'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>名称</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="请输入名称"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}