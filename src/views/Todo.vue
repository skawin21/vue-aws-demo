<template>
  <div id="todo">
    <h1>Todo App</h1>
    <input type="text" v-model="name" placeholder="Todo name">
    <input type="text" v-model="description" placeholder="Todo description">
    <button v-on:click="createTodo">Create Todo</button>
    <div v-for="(item, index) in todos" :key="item.id">
      <div>
        <h3>{{ item.name }}</h3>
        <p>{{ item.description }}</p>
      </div>
      <div>

<!--        <amplify-s3-image-picker />-->
        <input type="file" @change="uploadFile($event, index)" />
        <img :src="item.image" alt="upload_image" style="width:250px;" />
<!--        <amplify-s3-image :img-key="item.image" />-->
        <button @click="deleteTodo(item.id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { API, Storage } from 'aws-amplify';
import { createTodo, updateTodo, deleteTodo } from '@/graphql/mutations';
import { listTodos } from '@/graphql/queries';
import {onCreateTodo, onUpdateTodo, onDeleteTodo} from '@/graphql/subscriptions';

export default {
  name: 'Todo',
  data() {
    return {
      name: '',
      description: '',
      todos: []
    }
  },
  created() {
    this.getTodos();
    this.subscribe();
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    subscribe() {
      if (this.unsubscribe) this.unsubscribe()
      API.graphql({ query: onCreateTodo })
          .subscribe({
            next: (eventData) => {
              let todo = eventData.value.data.onCreateTodo;
              if (this.todos.some(item => item.name === todo.name)) return; // remove duplications
              this.todos = [...this.todos, todo];
            }
          });
      API.graphql({ query: onDeleteTodo })
          .subscribe({
            next: (eventData) => {
              let todo = eventData.value.data.onDeleteTodo;
              if (!this.todos.some(item => item.name === todo.name)) return; // remove duplications
              this.todos = this.todos.filter(item => item.id !== todo.id);
            }
          });
      API.graphql({ query: onUpdateTodo })
          .subscribe({
            next: (eventData) => {
              let todo = eventData.value.data.onUpdateTodo;
              if (!this.todos.some(item => item.name === todo.name)) return; // remove duplications
              console.log(this.todos)
              this.getTodos()
            }
          });
    },
    async createTodo() {
      const { name, description } = this;
      if (!name || !description) return;
      const todo = { name, description };
      await API.graphql({
        query: createTodo,
        variables: {input: todo},
      });
      this.name = '';
      this.description = '';
    },
    async updateTodo(item) {
      if (!item) return;
      const todo = {
        id: item.id,
        image: item.image
      }

      await API.graphql({
        query: updateTodo,
        variables: {input: todo},
      });
    },
    async getTodos() {
      const todos = await API.graphql({
        query: listTodos
      });
      this.todos = todos.data.listTodos.items;
    },
    async deleteTodo(id) {
      if (!id) return;
      const todo = { id };
      await API.graphql({
        query: deleteTodo,
        variables: {input: todo},
      });
    },
    async setFileKey(data) {
      console.log(data)
    },
    async uploadFile(e, idx) {
      const file = e.target.files[0];
      console.log(file)

      console.log(idx)
      try {
        await Storage.put(file.name, file, {
          contentType: 'image/png' // contentType is optional
        });

        this.todos[idx].image = await Storage.get(file.name, {
          level: 'public',
        })
        // this.todos[idx].image = file.name
        await this.updateTodo(this.todos[idx])

      } catch (error) {
        console.log('Error uploading file: ', error);
      }
    }
  }
};
</script>
