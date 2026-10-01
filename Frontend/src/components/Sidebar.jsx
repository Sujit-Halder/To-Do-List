import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaTasks, FaCog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaBars, FaTimes, FaChartPie, FaCheckCircle, FaHistory, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MenuItem from './MenuItem';
import ProfileImageUploader from './ProfileImageUploader';
import axios from 'axios';
import { notify } from '../utils/notifications';

const Sidebar = React.memo(({ user, onTasklistSelect }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [tasklists, setTasklists] = useState([]);
  const [showTaskLists, setShowTaskLists] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar visibility
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [creationError, setCreationError] = useState('');
  const [categoryPage, setCategoryPage] = useState(0);
  const [editingListName, setEditingListName] = useState('');
  const [editedListName, setEditedListName] = useState('');
  const [deletingListName, setDeletingListName] = useState('');
  const taskListsPerPage = 4;
  const categoryPageCount = Math.max(1, Math.ceil(tasklists.length / taskListsPerPage));
  const visibleTasklists = tasklists.slice(categoryPage * taskListsPerPage, (categoryPage + 1) * taskListsPerPage);

  // Fetch task lists from user prop on mount
  useEffect(() => {
    if (user?.tasklists) {
      setTasklists(user.tasklists);
    }
  }, [user]);

  useEffect(() => {
    setCategoryPage((current) => Math.min(current, categoryPageCount - 1));
  }, [categoryPageCount]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleMenuClick = (menuName) => {
    setActiveItem(menuName);
    onTasklistSelect(['Settings', 'Help'].includes(menuName) ? menuName : null);
    if (menuName !== 'Task Categories') setIsSidebarOpen(false);
    if (menuName === 'Logout') {
      handleLogout();
    }
    if (menuName === 'Task Categories') {
      setShowTaskLists(!showTaskLists);
    }
  };

  const handleAddTaskList = async (event) => {
    event.preventDefault();
    const name = newTaskListName.trim();
    setCreationError('');
    if (!name) {
      setCreationError('Enter a name for your new list.');
      return;
    }
    if (name.length > 60) {
      setCreationError('Use 60 characters or fewer.');
      return;
    }
    if (tasklists.some((tasklist) => tasklist.name.toLowerCase() === name.toLowerCase())) {
      setCreationError('A list with this name already exists.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      setIsCreatingList(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/tasklists`,
        { name, tasks: [] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setTasklists(response.data.tasklists);
        setCategoryPage(Math.max(0, Math.ceil(response.data.tasklists.length / taskListsPerPage) - 1));
        setNewTaskListName('');
        setShowNewListForm(false);
        notify(response.data.message || `“${name}” was created.`, 'success');
      } else {
        setCreationError('The list could not be created. Please try again.');
      }
    } catch (error) {
      console.error('Error adding task list:', error.response?.data || error.message);
      setCreationError(error.response?.data?.message || 'The list could not be created. Please try again.');
    } finally {
      setIsCreatingList(false);
    }
  };

  const openNewListForm = () => {
    setCreationError('');
    setShowNewListForm(true);
  };

  const closeNewListForm = () => {
    if (isCreatingList) return;
    setShowNewListForm(false);
    setNewTaskListName('');
    setCreationError('');
  };

  const startEditingTaskList = (tasklistName) => {
    setDeletingListName('');
    setEditingListName(tasklistName);
    setEditedListName(tasklistName);
  };

  const handleEditTaskList = async (event) => {
    event.preventDefault();
    const tasklistName = editingListName;
    const newName = editedListName.trim();
    if (!newName || newName === tasklistName) { setEditingListName(''); return; }
    if (tasklists.some((list) => list.name.toLowerCase() === newName.toLowerCase() && list.name !== tasklistName)) {
      notify('A list with that name already exists.', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/tasklists`,
        { oldName: tasklistName, newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setTasklists(response.data.tasklists);
        setEditingListName('');
        notify(response.data.message || `List renamed to “${newName}”.`, 'success');
      } else {
        notify('The list could not be renamed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error editing task list:', error.response?.data || error.message);
      notify(error.response?.data?.message || 'The list could not be renamed. Please try again.', 'error');
    }
  };

  const handleDeleteTaskList = async (tasklistName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/tasklists`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { name: tasklistName },
      });

      if (response.status === 200) {
        setTasklists(response.data.tasklists);
        setDeletingListName('');
        notify(response.data.message || `“${tasklistName}” was deleted.`, 'success');
      } else {
        notify('The list could not be deleted. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error deleting task list:', error.response?.data || error.message);
      notify(error.response?.data?.message || 'The list could not be deleted. Please try again.', 'error');
    }
  };

  const handleTasklistClick = (tasklistName) => {
    if (activeItem === tasklistName) {
      return;
    }
    setActiveItem(tasklistName);
    onTasklistSelect(tasklistName);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Menu Button for Mobile */}
      <button
        className="fixed left-3 top-3 z-40 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open Sidebar"
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(86vw,280px)] flex-col justify-between bg-red-400 px-4 py-5 text-white shadow-2xl transition-transform duration-300 md:relative md:z-20 md:w-64 md:shrink-0 md:translate-x-0 md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Close Button for Mobile */}
        <button
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close Sidebar"
        >
          <FaTimes />
        </button>

        <div>
          <div className="mb-7 flex flex-col items-center space-y-2 pt-2">
            <ProfileImageUploader currentImage={user?.image} />
            <h2 className="max-w-full truncate text-base font-semibold">{user?.name || 'Your workspace'}</h2>
            <p className="max-w-full truncate text-xs text-white/75">{user?.email || 'Loading profile...'}</p>
          </div>

          <nav className="space-y-1.5">
            {/* Static Menu Items */}
            <MenuItem
              icon={<FaTachometerAlt />}
              text="Dashboard"
              active={activeItem === 'Dashboard'}
              onClick={() => handleMenuClick('Dashboard')}
            />

            {/* Task Categories */}
            <div className="relative">
              <div className="relative">
                <MenuItem
                  icon={<FaTasks />}
                  text="Task Categories"
                  active={(activeItem === 'Task Categories') || ((activeItem !== 'Dashboard') && (activeItem !== 'Settings') && (activeItem !== 'Help') && (activeItem !== 'Logout') && (activeItem !== 'Completed & Overdue Tasks') && (activeItem !== 'Tasks Progress') && (activeItem !== 'Activity Log'))}
                  onClick={() => handleMenuClick('Task Categories')}
                />
                <FaChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-transform duration-300 ${showTaskLists ? 'rotate-180' : ''}`} />
              </div>
              <div className={`absolute left-0 right-0 top-full z-30 mt-2 origin-top transition-all duration-200 ease-out md:left-[calc(100%+12px)] md:right-auto md:top-0 md:mt-0 md:w-72 md:origin-top-left ${showTaskLists ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0 pointer-events-none'}`} aria-hidden={!showTaskLists} inert={!showTaskLists}>
                <div className="rounded-2xl border border-white/20 bg-red-400 p-2 shadow-2xl ring-1 ring-slate-950/10">
                  <div className="mb-2 flex items-center justify-between px-2 pt-1">
                    <div><p className="text-xs font-semibold text-white">Your task lists</p><p className="text-[10px] text-white/65">Choose or manage a list</p></div>
                    <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold text-white">{tasklists.length}</span>
                  </div>
                  <div className="space-y-1 rounded-xl bg-black/5 p-1">
                    {visibleTasklists.map((tasklist, index) => (
                      <div key={tasklist.name || index} className={`group flex items-center gap-1 rounded-xl transition-colors ${activeItem === tasklist.name ? 'bg-white text-red-500 shadow-sm' : 'hover:bg-white/10'}`}>
                        <button type="button" onClick={() => handleTasklistClick(tasklist.name)} className={`touch-control flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm ${activeItem === tasklist.name ? 'text-red-500' : 'text-white/90'}`} title={`Open ${tasklist.name}`}>
                          <FaTasks className="shrink-0 text-xs opacity-80" />
                          <span className="truncate font-medium">{tasklist.name}</span>
                        </button>
                        <div className="flex shrink-0 gap-0.5 pr-1 opacity-75 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            onClick={() => startEditingTaskList(tasklist.name)}
                            className={`touch-control rounded-lg p-1.5 transition ${activeItem === tasklist.name ? 'text-red-400 hover:bg-red-50' : 'text-white hover:bg-white/15'}`}
                            aria-label={`Rename ${tasklist.name}`}
                            title={`Rename ${tasklist.name}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => { setEditingListName(''); setDeletingListName(tasklist.name); }}
                            className={`touch-control rounded-lg p-1.5 transition ${activeItem === tasklist.name ? 'text-red-400 hover:bg-red-50' : 'text-white hover:bg-white/15'}`}
                            aria-label={`Delete ${tasklist.name}`}
                            title={`Delete ${tasklist.name}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    {editingListName && (
                      <form onSubmit={handleEditTaskList} className="mt-2 rounded-xl border border-white/20 bg-white/10 p-2.5">
                        <label htmlFor="rename-task-list" className="mb-1.5 block text-[11px] font-semibold text-white">Rename “{editingListName}”</label>
                        <input id="rename-task-list" value={editedListName} onChange={(event) => setEditedListName(event.target.value)} maxLength={60} autoFocus className="w-full rounded-lg border border-white/20 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-white/15" />
                        <div className="mt-2 flex gap-2"><button type="button" onClick={() => setEditingListName('')} className="touch-control flex-1 rounded-lg py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">Cancel</button><button type="submit" className="touch-control flex-1 rounded-lg bg-white py-1.5 text-xs font-semibold text-red-500 shadow-sm hover:bg-red-50">Save</button></div>
                      </form>
                    )}
                    {deletingListName && (
                      <div className="mt-2 rounded-xl border border-red-200/30 bg-slate-950/15 p-2.5" role="alertdialog" aria-label={`Delete ${deletingListName}`}>
                        <p className="text-xs font-semibold text-white">Delete “{deletingListName}”?</p><p className="mt-1 text-[11px] leading-4 text-white/65">Its tasks will also be permanently deleted.</p>
                        <div className="mt-2 flex gap-2"><button type="button" onClick={() => setDeletingListName('')} className="touch-control flex-1 rounded-lg py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">Keep it</button><button type="button" onClick={() => handleDeleteTaskList(deletingListName)} className="touch-control flex-1 rounded-lg bg-white py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50">Delete</button></div>
                      </div>
                    )}
                    {!tasklists.length && <p className="px-3 py-2 text-xs text-white/70">No task lists yet.</p>}
                    {!showNewListForm && <button onClick={openNewListForm} className="touch-control mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 px-3 py-2 text-xs font-semibold text-white/90 transition hover:border-white/60 hover:bg-white/10" aria-label="Add task list" title="Create a new task list"><FaPlus /> New list</button>}
                    {showNewListForm && (
                      <form onSubmit={handleAddTaskList} className="mt-2 rounded-xl border border-white/20 bg-white/10 p-2.5 shadow-inner" onKeyDown={(event) => event.key === 'Escape' && closeNewListForm()}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <label htmlFor="new-task-list-name" className="text-xs font-semibold text-white">New task list</label>
                          <span className={`text-[10px] ${newTaskListName.length > 60 ? 'text-amber-200' : 'text-white/60'}`}>{newTaskListName.length}/60</span>
                        </div>
                        <input
                          id="new-task-list-name"
                          type="text"
                          value={newTaskListName}
                          onChange={(event) => { setNewTaskListName(event.target.value); if (creationError) setCreationError(''); }}
                          placeholder="e.g. Weekly planning"
                          maxLength={70}
                          autoFocus
                          disabled={isCreatingList}
                          className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/15 disabled:opacity-60"
                          aria-describedby={creationError ? 'new-list-error' : 'new-list-hint'}
                        />
                        {creationError ? <p id="new-list-error" className="mt-1.5 text-xs font-medium text-amber-100" role="alert">{creationError}</p> : <p id="new-list-hint" className="mt-1.5 text-[11px] text-white/65">Press Enter to create · Esc to cancel</p>}
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={closeNewListForm} disabled={isCreatingList} className="touch-control flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50">Cancel</button>
                          <button type="submit" disabled={isCreatingList || !newTaskListName.trim()} className="touch-control flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55">{isCreatingList ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-red-200 border-t-red-500" /> Saving</> : <><FaPlus /> Create</>}</button>
                        </div>
                      </form>
                    )}
                    {categoryPageCount > 1 && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-white/10 px-1.5 py-1">
                        <button type="button" onClick={() => setCategoryPage((page) => Math.max(0, page - 1))} disabled={categoryPage === 0} className="touch-control grid h-7 w-7 place-items-center rounded-md text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Previous task-list page" title="Previous lists"><FaChevronLeft /></button>
                        <span className="text-[10px] font-semibold text-white/75">{categoryPage + 1} of {categoryPageCount}</span>
                        <button type="button" onClick={() => setCategoryPage((page) => Math.min(categoryPageCount - 1, page + 1))} disabled={categoryPage === categoryPageCount - 1} className="touch-control grid h-7 w-7 place-items-center rounded-md text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next task-list page" title="Next lists"><FaChevronRight /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Static Menu Items */}

            {
              isSidebarOpen &&
              <>
                <MenuItem
                  icon={<FaCheckCircle />}
                  text="Completed & Overdue Tasks"
                  active={activeItem === 'Completed & Overdue Tasks'}
                  onClick={() => handleTasklistClick('Completed & Overdue Tasks')}
                />
                <MenuItem
                  icon={<FaChartPie />}
                  text="Tasks Progress"
                  active={activeItem === 'Tasks Progress'}
                  onClick={() => handleTasklistClick('Tasks Progress')}
                />
              </>
            }


            <MenuItem
              icon={<FaHistory />}
              text="Activity Log"
              active={activeItem === 'Activity Log'}
              onClick={() => handleTasklistClick('Activity Log')}
            />

            <MenuItem
              icon={<FaCog />}
              text="Settings"
              active={activeItem === 'Settings'}
              onClick={() => handleMenuClick('Settings')}
            />
            <MenuItem
              icon={<FaQuestionCircle />}
              text="Help"
              active={activeItem === 'Help'}
              onClick={() => handleMenuClick('Help')}
            />
          </nav>
        </div>

        <MenuItem
          icon={<FaSignOutAlt />}
          text="Logout"
          active={activeItem === 'Logout'}
          onClick={() => handleMenuClick('Logout')}
        />
      </aside>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
});

export default Sidebar;
