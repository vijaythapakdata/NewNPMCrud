import * as React from 'react';
// import styles from './Crud.module.scss';
import type { ICrudProps } from './ICrudProps';
import { spfi,SPFI } from '@pnp/sp/presets/all';
import { SPFx } from '@pnp/sp/presets/all';
import { DefaultButton, DetailsList, Dialog, DialogFooter, DialogType, IconButton, PrimaryButton, SelectionMode, TextField } from '@fluentui/react';

interface IQuotesState{
  Title:string;
  Author:string;
  Id:number;
}

interface IQuote{
  quote:string;
  author:string;
  id:number;
}

const  Crud=(props:ICrudProps):React.ReactElement=>{
  const _sp:SPFI=spfi().using(SPFx(props.context));
  const [reload,setReload]=React.useState<boolean>(false);
  const [quotes,setQuotes]=React.useState<Array<IQuote>>([]);
  const [currentId,setCurrentId]=React.useState<number|any>();
  const [isEditHidden,setIsEditHidden]=React.useState<boolean>(true);
  const [editeQuote,setEditQuote]=React.useState<string>('');
  const [editeAuthor,setEditAuthor]=React.useState<string>('');
  const [isAddHidden,setIsAddHidden]=React.useState<boolean>(true);
  const [newQuote,setNewQuote]=React.useState<string>('');
  const [newAuthor,setNewAuthor]=React.useState<string>('');
  //use eefect hook to fetch the list items
  React.useEffect(()=>{
    getListItems();
  },[reload]);

  //read items
  const getListItems=async()=>{
    try{
const getlistitems=await _sp.web.lists.getByTitle('Quotes').items();
//settting the list items to the state
setQuotes(getlistitems.map((each:IQuotesState)=>({
  quote:each.Title,
  author:each.Author,
  id:each.Id
})));
    }
    catch(err){
console.log(err);
    }
    finally{
console.log("List items fetched",quotes);
    }
  }

  
    const handleQuotes=(event:React.ChangeEvent<HTMLInputElement>)=>{
      setNewQuote(event.target.value);
    }
    const handleAuthor=(event:React.ChangeEvent<HTMLInputElement>)=>{
      setNewAuthor(event.target.value);
    }
    //create new item over list
    const createListItems=async()=>{
      const list=_sp.web.lists.getByTitle('Quotes');
      try{
await list.items.add({
  Title:newQuote,
  Author:newAuthor
});
//close the add modal dialog
setIsAddHidden(true);
setReload(!reload);
console.log("list item is created");
      }
      catch(err){
console.log(err);
      }
      finally{
setIsAddHidden(true);
      }
    }
  
    const openEditDialog=(id:number)=>{
      setCurrentId(id);
      //thhis function would open the edit dialog and expose a form
      setIsEditHidden(false);
      const quote:IQuote|undefined=quotes.find((each:any)=>each.id===id);
      if(quote){
        setEditAuthor(quote.author);
        setEditQuote(quote.quote);
      }
    }
    
 

  const handleQuoteChange=(event:React.ChangeEvent<HTMLInputElement>)=>{

    //handling the change of the quote
    setEditQuote(event.target.value);
  }
  const handleAuthorChange=(event:React.ChangeEvent<HTMLInputElement>)=>{
    setEditAuthor(event.target.value);
  }
//Edit list item

const editListItem=async()=>{
  const list=_sp.web.lists.getByTitle('Quotes');
  try{
    await list.items.getById(currentId).update({
      Title:editeQuote,
      Author:editeAuthor
    });
    //close the edit modal dialog
    setIsEditHidden(true);
    //trigger the reload
    setReload(!reload);
    console.log("list item is updated");
  }
  catch(err){
    console.log(err);
  }
  finally{
    setIsEditHidden(true);
  }
}
  //delete list item
  const deleteListItem=async(id:number)=>{

    const list=_sp.web.lists.getByTitle('Quotes');
    try{
      await list.items.getById(id).delete();
      setReload(!reload);
      console.log("list item is deleted");
    }
    catch(err){
      console.log(err);
    }
  }

 

  return(
    <>
    <div className='quotebox'>
      <h2>Quotes</h2>
      <div className='quotecontainer'>
        <DetailsList
        
        items={quotes||[]}
        columns={[
          {key:'QuoteColumn',
            name:'Quote',
            fieldName:'quote',
            minWidth:100,
            isResizable:true,
            onRender:(item:IQuote)=><div>{item.quote}</div>
          },
          {
            key:'AuthorColumn',
            name:'Author',
            fieldName:'author',
            minWidth:100,
            isResizable:true,
            onRender:(item:IQuote)=><div>{item.author}</div>
          },
          {
            key:'ActionColumn',
            name:'Actions',
            fieldName:'actions',
            minWidth:100,
            isResizable:true,
           onRender:(item:IQuote)=>(
            <div>
              <IconButton
              iconProps={{iconName:'Edit'
              }}
              onClick={()=>openEditDialog(item.id)}
              title='Edit'
              ariaLabel='Edit'
              />
               <IconButton
              iconProps={{iconName:'Delete'
              }}
              onClick={()=>deleteListItem(item.id)}
              title='Delete'
              ariaLabel='Delete'
              />
              </div>
           )
          }
          
        ]}
        selectionMode={SelectionMode.none}
        />
        <Dialog
        hidden={isEditHidden}
        onDismiss={()=>setIsEditHidden(true)}
       dialogContentProps={{
        type:DialogType.normal,
        title:'Edit Quote',
       }}
       
        >

<div>
<TextField
label='Quote'
value={editeQuote}
onChange={handleQuoteChange}
/>
<TextField
label='Author'
value={editeAuthor}
onChange={handleAuthorChange}

/>

</div>

<DialogFooter>
  <PrimaryButton
  onClick={()=>editListItem()}
  text='Save'
  />
  <DefaultButton
  onClick={()=>setIsEditHidden(true)}
  text='Cancel'
  />
</DialogFooter>
        </Dialog>
      </div>
      <div>
        <PrimaryButton
        text='Add Quote'
        onClick={()=>setIsAddHidden(false)}/>
      </div>
      <Dialog hidden={isAddHidden}
      onDismiss={()=>setIsAddHidden(true)}
      dialogContentProps={{
        type:DialogType.normal,
        title:'Add Quote',
      }}>
        <div>
          <TextField
          label='Quote'
          value={newQuote}
          onChange={handleQuotes}
          />
          <TextField
          label='Author'
          value={newAuthor}
          onChange={handleAuthor}
          />
        </div>
        <DialogFooter>
  <PrimaryButton
  onClick={()=>createListItems()}
  text='Save'
  />
  <DefaultButton
  onClick={()=>setIsEditHidden(true)}
  text='Cancel'
  />
</DialogFooter>
      </Dialog>
    </div>
    
    </>
  )
}
export default Crud;